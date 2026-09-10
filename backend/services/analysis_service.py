"""
analysis_service.py
-------------------
Orchestration service for the NovaAI Earth Observation Analysis pipeline.

Coordinates the complete flow:
  1. Image loading and validation        — image_loader
  2. RemoteCLIP inference                — vision.inference
  3. EO interpretation                   — interpreter.eo_interpreter
  4. Prompt construction                 — prompts.prompt_builder
  5. GPT analysis                        — llm.gpt_service
  6. Unified AnalysisResponse assembly   — schemas.analysis

Design rules:
  - Reuses existing validated modules; no logic is duplicated.
  - RemoteCLIP singleton is reused across requests (no re-loading).
  - GPT failure is non-fatal: pipeline returns partial_success with vision results intact.
  - Raw vision internals (embeddings, scores) are never included in the production response.
  - All stages are logged; no prompt content, API keys, or image bytes are logged.
"""

import time
import json
import base64
from datetime import datetime, timezone
from typing import Optional

from PIL import Image

from backend.vision.image_loader import validate_and_load_image
from backend.vision.inference import run_remoteclip_inference
from backend.vision.remoteclip import remoteclip_service

from backend.interpreter.eo_interpreter import interpret
from backend.interpreter.eo_schema import SimilarityEntry

from backend.prompts.prompt_builder import prompt_builder
from backend.schemas.prompt import EOContext

from backend.llm.gpt_service import GPTService
from backend.llm.openrouter import OpenRouterClient

from backend.schemas.analysis import (
    AnalysisResponse,
    AnalysisMetadata,
    LandCoverClass,
    AnalysisFlag,
)
from backend.utils.logger import logger
from backend.report.schemas import ReportRequest, ReportResponse
from backend.report.report_service import report_service
from backend.report.html_renderer import html_renderer


class AnalysisService:
    """
    Orchestrates the complete EO analysis pipeline for POST /api/analyze.

    Instantiates exactly one GPTService backed by one OpenRouterClient.
    The RemoteCLIP model is accessed via its module-level singleton
    (remoteclip_service) and is loaded lazily on first request.
    """

    def __init__(self):
        provider = OpenRouterClient()
        self.gpt_service = GPTService(provider)
        logger.info("AnalysisService initialized.")

    # ------------------------------------------------------------------
    # Public pipeline entrypoint
    # ------------------------------------------------------------------

    async def analyze_image(
        self,
        image_bytes: bytes,
        filename: str,
    ) -> AnalysisResponse:
        """
        Execute the full EO analysis pipeline on an uploaded image.

        Args:
            image_bytes: Raw bytes of the uploaded image file.
            filename:    Original filename (used for extension validation).

        Returns:
            AnalysisResponse — fully populated on success, or partial_success
            if GPT analysis fails (vision + EO interpretation are still returned).

        Raises:
            ValueError:  When image validation or EO interpretation fails.
            RuntimeError: When RemoteCLIP model cannot be loaded.
        """
        pipeline_start = time.perf_counter()
        logger.info(f"[analyze_image] Pipeline started for '{filename}'.")

        # ----------------------------------------------------------------
        # Stage 1 — Image loading and validation
        # ----------------------------------------------------------------
        logger.info("[analyze_image] Stage 1: Loading and validating image.")
        pil_image = self._load_image(image_bytes, filename)
        logger.info("[analyze_image] Stage 1: Image loaded successfully.")

        # ----------------------------------------------------------------
        # Stage 2 — Ensure RemoteCLIP model is ready
        # ----------------------------------------------------------------
        logger.info("[analyze_image] Stage 2: Ensuring RemoteCLIP model is loaded.")
        self._ensure_model_loaded()
        vision_model_id = f"RemoteCLIP {remoteclip_service.model_name}"
        logger.info(f"[analyze_image] Stage 2: Model ready — {vision_model_id}.")

        # ----------------------------------------------------------------
        # Stage 3 — RemoteCLIP inference
        # ----------------------------------------------------------------
        logger.info("[analyze_image] Stage 3: Running RemoteCLIP inference.")
        raw_outputs = self.run_remoteclip(pil_image)
        logger.info("[analyze_image] Stage 3: RemoteCLIP inference complete.")

        # ----------------------------------------------------------------
        # Stage 4 — EO interpretation
        # ----------------------------------------------------------------
        logger.info("[analyze_image] Stage 4: Interpreting EO scene.")
        eo_result = self.interpret_scene(
            raw_outputs["zero_shot_inspection"],
            vision_model=vision_model_id,
        )
        logger.info(
            f"[analyze_image] Stage 4: EO interpretation complete. "
            f"Dominant={eo_result.dominant_land_cover}, "
            f"Confidence={eo_result.relative_confidence}."
        )

        # ----------------------------------------------------------------
        # Stage 5 — Build PromptPayload
        # ----------------------------------------------------------------
        logger.info("[analyze_image] Stage 5: Building prompt payload.")
        eo_ctx = EOContext(
            dominant_land_cover=eo_result.dominant_land_cover,
            secondary_land_cover=eo_result.secondary_land_cover,
            confidence=eo_result.relative_confidence,
            summary=eo_result.summary,
        )
        prompt_payload = prompt_builder.build_prompt(eo_ctx)
        logger.info("[analyze_image] Stage 5: Prompt payload ready.")

        # ----------------------------------------------------------------
        # Stage 6 — GPT analysis (non-fatal)
        # ----------------------------------------------------------------
        logger.info("[analyze_image] Stage 6: Requesting GPT analysis.")
        gpt_text, gpt_warning, llm_model_id = await self._safe_gpt_analysis(prompt_payload)

        if gpt_text:
            logger.info("[analyze_image] Stage 6: GPT analysis received.")
        else:
            logger.warning(f"[analyze_image] Stage 6: GPT unavailable — {gpt_warning}.")

        # ----------------------------------------------------------------
        # Stage 6.5 — Claude Professional Report & Unified HTML
        # ----------------------------------------------------------------
        professional_report = None
        report_model_id = None
        
        # Build frontend-compatible classes first for HTML renderer
        # NOTE: Use raw_outputs from Stage 3 directly — do NOT overwrite it.
        raw_outputs_zs = raw_outputs["zero_shot_inspection"]
        classes = self._build_classes(raw_outputs_zs)
        
        # Derive risk
        risk_map = {"High": "Low", "Medium": "Medium", "Low": "High"}
        risk_level = risk_map.get(eo_result.relative_confidence, "Medium")
        
        # Pre-build bulletproof fallbacks if Claude is offline or gives invalid JSON
        fallback_json = {
            "executive_dashboard": {
                "overall_status": f"Monitored {eo_result.dominant_land_cover} Zone",
                "risk_level": risk_level,
                "scene_type": "Natural" if "forest" in str(eo_result.dominant_land_cover).lower() or "water" in str(eo_result.dominant_land_cover).lower() else "Urban"
            },
            "environmental_assessment": {
                "vegetation": "High" if "forest" in str(eo_result.dominant_land_cover).lower() or "agricult" in str(eo_result.dominant_land_cover).lower() else "Low",
                "urban_density": "High" if "urban" in str(eo_result.dominant_land_cover).lower() or "resid" in str(eo_result.dominant_land_cover).lower() else "Low",
                "water_presence": "Detected" if "water" in str(eo_result.dominant_land_cover).lower() else "Not Detected",
                "industrial_activity": "Detected" if "indust" in str(eo_result.dominant_land_cover).lower() else "Not Detected",
                "environmental_risk": risk_level
            },
            "key_findings": [
                f"Primary land cover classified as {eo_result.dominant_land_cover} with {eo_result.relative_confidence} confidence.",
                f"Secondary structures indicate {eo_result.secondary_land_cover} mix." if eo_result.secondary_land_cover and eo_result.secondary_land_cover != "Undetermined" else "No dominant secondary structures detected.",
                "Stable terrain conditions observed under current geospatial telemetry."
            ],
            "recommendations": [
                "Establish periodic observation schedules to monitor changes.",
                "Verify vegetation index adjustments over the next satellite pass."
            ]
        }

        claude_json = {}
        if gpt_text:
            logger.info("[analyze_image] Stage 6.5: Requesting Claude JSON report.")
            try:
                report_req = ReportRequest(
                    dominant_land_cover=eo_result.dominant_land_cover,
                    secondary_land_cover=(eo_result.secondary_land_cover if eo_result.secondary_land_cover != "Undetermined" else None),
                    confidence=eo_result.relative_confidence,
                    summary=eo_result.summary,
                    gpt_analysis=gpt_text
                )
                report_res = await report_service.generate_professional_report(report_req)
                
                if report_res.report == "Report unavailable":
                    logger.warning("[analyze_image] Stage 6.5: Claude unavailable. Merging fallback.")
                    gpt_warning = "Professional report fallback used." if not gpt_warning else f"{gpt_warning} | Fallback used."
                else:
                    report_model_id = report_res.model
                    raw_text = report_res.report.strip()
                    if raw_text.startswith("```json"):
                        raw_text = raw_text.split("```json")[1].split("```")[0].strip()
                    elif raw_text.startswith("```"):
                        raw_text = raw_text.split("```")[1].split("```")[0].strip()
                        
                    try:
                        claude_json = json.loads(raw_text)
                    except json.JSONDecodeError:
                        logger.error("[analyze_image] Stage 6.5: Claude JSON invalid")
                        claude_json = {}
            except Exception as e:
                logger.error(f"[analyze_image] Stage 6.5: Claude failed unexpectedly: {e}")
                gpt_warning = "Professional report fallback used." if not gpt_warning else f"{gpt_warning} | Fallback used."

        # Merge Claude results with fallbacks to guarantee absolute structural integrity
        merged_json = {
            "executive_dashboard": {**fallback_json["executive_dashboard"], **claude_json.get("executive_dashboard", {})},
            "environmental_assessment": {**fallback_json["environmental_assessment"], **claude_json.get("environmental_assessment", {})},
            "key_findings": claude_json.get("key_findings", fallback_json["key_findings"])[:6],
            "recommendations": claude_json.get("recommendations", fallback_json["recommendations"])[:4]
        }

        # Always construct the Unified report HTML using html_renderer
        try:
            img_b64 = base64.b64encode(image_bytes).decode("utf-8") if image_bytes else None
            mock_resp_data = {
                "dominant_land_cover": str(eo_result.dominant_land_cover),
                "secondary_land_cover": str(eo_result.secondary_land_cover) if eo_result.secondary_land_cover and eo_result.secondary_land_cover != "Undetermined" else None,
                "confidence": str(eo_result.relative_confidence),
                "summary": eo_result.summary,
                "classes": classes,
                "risk_level": risk_level,
            }
            professional_report = html_renderer.render(mock_resp_data, merged_json, img_b64)
            logger.info("[analyze_image] Stage 6.5: Unified HTML generated successfully.")
        except Exception as render_err:
            logger.error(f"[analyze_image] Stage 6.5 HTML Render crash: {render_err}")
            professional_report = f"<h1>NovaAI Error</h1><p>Failed to render report: {render_err}</p>"


        # ----------------------------------------------------------------
        # Stage 7 — Assemble AnalysisResponse
        # ----------------------------------------------------------------
        pipeline_ms = (time.perf_counter() - pipeline_start) * 1000
        status = "success" if gpt_text else "partial_success"

        # Flags: surface partial-success and low-confidence situations
        flags = self._build_flags(status, eo_result.relative_confidence, gpt_warning)

        # insight: prefer the GPT narrative; fall back to the static summary
        insight = gpt_text or eo_result.summary

        # title: short scene descriptor shown in the report card header
        title = f"{eo_result.dominant_land_cover} Scene Analysis"

        response = AnalysisResponse(
            status=status,
            dominant_land_cover=eo_result.dominant_land_cover,
            secondary_land_cover=(
                eo_result.secondary_land_cover
                if eo_result.secondary_land_cover != "Undetermined"
                else None
            ),
            confidence=eo_result.relative_confidence,
            summary=eo_result.summary,
            gpt_analysis=gpt_text,
            professional_report=professional_report,
            warning=gpt_warning,
            # Frontend-compatible fields
            insight=insight,
            classes=classes,
            flags=flags,
            title=title,
            risk_level=risk_level,
            metadata=AnalysisMetadata(
                vision_model=vision_model_id,
                llm_model=llm_model_id,
                report_model=report_model_id,
                processing_time_ms=round(pipeline_ms, 2),
                timestamp=datetime.now(timezone.utc).isoformat(),
                version="1.0",
            ),
        )

        logger.info(
            f"[analyze_image] Pipeline completed in {pipeline_ms:.1f}ms. "
            f"Status: {status}."
        )
        return response


    # ------------------------------------------------------------------
    # Stage helpers
    # ------------------------------------------------------------------

    def run_remoteclip(self, image: Image.Image) -> dict:
        """
        Run RemoteCLIP inference on a pre-validated RGB PIL Image.

        Args:
            image: A validated PIL Image in RGB mode.

        Returns:
            Raw inference output dict from run_remoteclip_inference, containing
            embedding_shape, embeddings_stats, zero_shot_inspection, and performance.
        """
        return run_remoteclip_inference(image)

    def interpret_scene(
        self,
        zero_shot_inspection: list,
        vision_model: Optional[str] = None,
    ):
        """
        Convert raw zero_shot_inspection entries into structured EO context.

        Args:
            zero_shot_inspection: List of dicts (tag, cosine_similarity, confidence_score)
                                  from run_remoteclip_inference output.
            vision_model:         Optional model provenance string.

        Returns:
            EOInterpretation Pydantic model.
        """
        entries = [
            SimilarityEntry(
                tag=item["tag"],
                cosine_similarity=item["cosine_similarity"],
                confidence_score=item["confidence_score"],
            )
            for item in zero_shot_inspection
        ]
        return interpret(entries, vision_model=vision_model)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _load_image(image_bytes: bytes, filename: str) -> Image.Image:
        """Delegates to the validated image_loader module."""
        return validate_and_load_image(image_bytes, filename)

    @staticmethod
    def _ensure_model_loaded() -> None:
        """
        Ensures the RemoteCLIP singleton is loaded.
        Reuses the already-loaded model if available (no re-loading per request).
        """
        if remoteclip_service.model is None:
            logger.info("RemoteCLIP model not yet loaded — bootstrapping now.")
            remoteclip_service.load_model()

    async def _safe_gpt_analysis(self, prompt_payload) -> tuple[Optional[str], Optional[str], str]:
        """
        Calls GPTService and returns (gpt_text, warning, model_id).

        GPT failure is non-fatal. If the call fails for any reason,
        gpt_text is None and a descriptive warning string is returned.
        The pipeline continues and returns a partial_success response.

        Returns:
            Tuple of (gpt_text, warning_message, llm_model_id).
        """
        from backend.llm.openrouter import OpenRouterClient
        llm_model_id = self.gpt_service.provider.model or "unknown"

        try:
            result = await self.gpt_service.generate_response(
                system_prompt=prompt_payload.system_prompt,
                user_prompt=prompt_payload.user_prompt,
            )
            gpt_text = result.get("response", "").strip()
            llm_model_id = result.get("model", llm_model_id)
            return gpt_text or None, None, llm_model_id

        except Exception as e:
            logger.warning(f"GPT analysis failed (non-fatal): {type(e).__name__}: {e}")
            return None, "LLM analysis unavailable.", llm_model_id


    # ------------------------------------------------------------------
    # Frontend-compatibility helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _build_classes(zero_shot: list) -> list:
        """
        Convert raw zero_shot_inspection cosine scores into a list of
        LandCoverClass objects with percentage values for the frontend bar chart.

        The top 5 entries are taken, then cosine values are normalised to sum
        to 100 so they read as percentages.
        """
        # Colour palette mapped by common EO label keywords
        COLOUR_MAP = {
            "forest": "#10b981",
            "dense": "#10b981",
            "agricult": "#84cc16",
            "farm": "#84cc16",
            "crop": "#84cc16",
            "water": "#0ea5e9",
            "ocean": "#0ea5e9",
            "lake": "#0ea5e9",
            "river": "#38bdf8",
            "resid": "#a855f7",
            "urban": "#a855f7",
            "city": "#a855f7",
            "build": "#a855f7",
            "industri": "#f43f5e",
            "factory": "#f43f5e",
            "desert": "#eab308",
            "barren": "#eab308",
            "sand": "#eab308",
        }
        DEFAULT_COLOURS = [
            "#6366f1", "#ec4899", "#f97316", "#14b8a6", "#64748b"
        ]

        def _colour_for(tag: str) -> str:
            tag_lower = tag.lower()
            for kw, colour in COLOUR_MAP.items():
                if kw in tag_lower:
                    return colour
            return DEFAULT_COLOURS[0]

        # Take the top 5 by cosine_similarity
        top = sorted(zero_shot, key=lambda x: x["cosine_similarity"], reverse=True)[:5]
        if not top:
            return []

        total = sum(max(0.0, e["cosine_similarity"]) for e in top)
        if total == 0:
            total = 1.0  # avoid division by zero

        classes = []
        for i, entry in enumerate(top):
            label = entry["tag"].replace("a satellite photo of ", "").strip().title()
            raw = max(0.0, entry["cosine_similarity"])
            pct = round((raw / total) * 100, 1)
            colour = _colour_for(entry["tag"])
            if i >= 1 and _colour_for(entry["tag"]) == _colour_for(top[0]["tag"]):
                colour = DEFAULT_COLOURS[i % len(DEFAULT_COLOURS)]
            classes.append(LandCoverClass(label=label, pct=pct, color=colour))

        return classes

    @staticmethod
    def _build_flags(status: str, confidence: str, warning: str | None) -> list:
        """Build informational flags for the frontend report card."""
        flags = []
        if status == "partial_success":
            flags.append(AnalysisFlag(
                icon="⚠️",
                label="AI explanation unavailable — vision metrics shown only.",
                level="warning",
            ))
        if confidence == "Low":
            flags.append(AnalysisFlag(
                icon="ℹ️",
                label="Low confidence classification — image may be ambiguous or low-resolution.",
                level="info",
            ))
        return flags

    async def generate_professional_report(self, request: ReportRequest) -> ReportResponse:
        """
        Takes raw EO findings and GPT-OSS analysis and delegates them 
        to the ReportService to produce a structured, professional markdown report via Claude.
        """
        return await report_service.generate_professional_report(request)


# ---------------------------------------------------------------------------
# Module-level singleton — imported by the API router
# ---------------------------------------------------------------------------
analysis_service = AnalysisService()
