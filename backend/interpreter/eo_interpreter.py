"""
eo_interpreter.py
-----------------
Core EO Interpretation Layer.

Receives RemoteCLIP semantic outputs (zero_shot_inspection similarity scores)
and transforms them into structured Earth Observation context.

Constraints enforced by design:
  - Does NOT use raw embeddings.
  - Does NOT call GPT or any external LLM.
  - Does NOT fabricate information not supported by similarity scores.
  - Is stateless and has no network I/O.
"""

import time
from typing import List, Optional

from backend.interpreter.eo_schema import (
    SimilarityEntry,
    RankedEOConcept,
    EOInterpretation,
)
from backend.interpreter.eo_rules import (
    EO_CATEGORY_KEYWORDS,
    CONFIDENCE_THRESHOLDS,
    MIN_COSINE_SIMILARITY,
    STANDARD_LIMITATIONS,
    SUMMARY_TEMPLATE_FALLBACK,
    SUMMARY_TEMPLATE_HIGH,
    SUMMARY_TEMPLATE_LOW,
)
from backend.utils.logger import logger

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _resolve_eo_category(tag: str) -> str:
    """
    Maps a raw tag string to a canonical EO category name by scanning
    EO_CATEGORY_KEYWORDS for the first keyword that appears in the tag.
    Returns "Unknown" when no keyword matches.
    """
    tag_lower = tag.lower()
    for category, keywords in EO_CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in tag_lower:
                return category
    return "Unknown"


def _assign_confidence(confidence_score: float) -> str:
    """
    Maps a softmax-derived confidence_score to a qualitative confidence band.
    Bands are defined in eo_rules.CONFIDENCE_THRESHOLDS.
    """
    if confidence_score >= CONFIDENCE_THRESHOLDS["High"]:
        return "High"
    elif confidence_score >= CONFIDENCE_THRESHOLDS["Medium"]:
        return "Medium"
    else:
        return "Low"


def _build_summary(
    dominant: str,
    secondary: str,
    confidence: str,
) -> str:
    """
    Produces a deterministic, template-driven natural language summary.
    No GPT involved — output is fully reproducible.
    """
    if confidence == "High":
        return SUMMARY_TEMPLATE_HIGH.format(
            dominant=dominant,
            secondary=secondary,
        )
    elif confidence == "Low":
        return SUMMARY_TEMPLATE_LOW.format(dominant=dominant)
    else:
        return SUMMARY_TEMPLATE_FALLBACK.format(
            dominant=dominant,
            secondary=secondary,
            confidence=confidence,
        )


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

def interpret(
    similarity_entries: List[SimilarityEntry],
    vision_model: Optional[str] = None,
) -> EOInterpretation:
    """
    Transform RemoteCLIP zero-shot similarity results into structured EO context.

    Args:
        similarity_entries:  List of SimilarityEntry objects (tag + scores).
        vision_model:        Optional model provenance string for the response.

    Returns:
        EOInterpretation with dominant/secondary land cover, ranked matches,
        relative confidence, limitations, and a template-based summary.

    Raises:
        ValueError: If no valid entries survive noise filtering.
    """
    start = time.perf_counter()
    logger.info(f"EO interpretation started. Received {len(similarity_entries)} similarity entries.")

    # ------------------------------------------------------------------
    # 1. Filter noise — drop entries below minimum cosine similarity
    # ------------------------------------------------------------------
    valid_entries = [
        e for e in similarity_entries
        if e.cosine_similarity >= MIN_COSINE_SIMILARITY
    ]

    if not valid_entries:
        raise ValueError(
            f"All {len(similarity_entries)} similarity entries are below the minimum "
            f"cosine threshold ({MIN_COSINE_SIMILARITY}). No reliable EO context can be produced."
        )

    logger.info(f"  {len(valid_entries)} entries pass the cosine similarity threshold ({MIN_COSINE_SIMILARITY}).")

    # ------------------------------------------------------------------
    # 2. Map each entry to a canonical EO category
    # ------------------------------------------------------------------
    mapped: List[dict] = []
    for entry in valid_entries:
        category = _resolve_eo_category(entry.tag)
        mapped.append({
            "eo_category": category,
            "original_tag": entry.tag,
            "cosine_similarity": entry.cosine_similarity,
            "confidence_score": entry.confidence_score,
        })
        logger.info(
            f"  Tag -> Category: '{entry.tag}' -> '{category}' "
            f"(cos={entry.cosine_similarity:.4f}, softmax={entry.confidence_score:.4f})"
        )

    # ------------------------------------------------------------------
    # 3. Rank by cosine similarity (descending)
    # ------------------------------------------------------------------
    ranked = sorted(mapped, key=lambda x: x["cosine_similarity"], reverse=True)

    top_matches: List[RankedEOConcept] = [
        RankedEOConcept(
            rank=i + 1,
            eo_category=item["eo_category"],
            original_tag=item["original_tag"],
            cosine_similarity=round(item["cosine_similarity"], 6),
            confidence_score=round(item["confidence_score"], 6),
        )
        for i, item in enumerate(ranked)
    ]

    # ------------------------------------------------------------------
    # 4. Extract dominant and secondary land cover
    # ------------------------------------------------------------------
    dominant_match = top_matches[0]
    dominant_land_cover = dominant_match.eo_category

    secondary_land_cover = "Undetermined"
    if len(top_matches) >= 2:
        secondary_land_cover = top_matches[1].eo_category

    # ------------------------------------------------------------------
    # 5. Assign relative confidence band from dominant softmax score
    # ------------------------------------------------------------------
    relative_confidence = _assign_confidence(dominant_match.confidence_score)

    logger.info(
        f"  Dominant: '{dominant_land_cover}' | "
        f"Secondary: '{secondary_land_cover}' | "
        f"Confidence: {relative_confidence} "
        f"(softmax={dominant_match.confidence_score:.4f})"
    )

    # ------------------------------------------------------------------
    # 6. Build deterministic summary
    # ------------------------------------------------------------------
    summary = _build_summary(dominant_land_cover, secondary_land_cover, relative_confidence)

    # ------------------------------------------------------------------
    # 7. Assemble output
    # ------------------------------------------------------------------
    elapsed_ms = (time.perf_counter() - start) * 1000

    result = EOInterpretation(
        dominant_land_cover=dominant_land_cover,
        secondary_land_cover=secondary_land_cover,
        top_matches=top_matches,
        relative_confidence=relative_confidence,
        limitations=STANDARD_LIMITATIONS,
        summary=summary,
        vision_model=vision_model,
        interpretation_time_ms=round(elapsed_ms, 3),
    )

    logger.info(f"EO interpretation completed in {elapsed_ms:.2f}ms.")
    return result
