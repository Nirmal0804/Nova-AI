"""
question_service.py
-------------------
Service for answering predefined Earth Observation questions (Quick EO Insights).

Design rules:
  - Reuses the EOContext already produced by /api/analyze.
  - Does NOT re-run RemoteCLIP or the EO Interpreter.
  - Does NOT modify or re-validate the production analysis pipeline.
  - Delegates prompt construction to PromptBuilder.build_question_prompt().
  - Delegates GPT calls to GPTService backed by OpenRouterClient.
  - GPT failure is surfaced as a clear error — callers decide how to handle it.
"""

from typing import Optional

from backend.prompts.prompt_builder import prompt_builder
from backend.schemas.prompt import EOContext
from backend.llm.gpt_service import GPTService
from backend.llm.openrouter import OpenRouterClient
from backend.utils.logger import logger


class QuestionService:
    """
    Answers a single predefined EO question using the completed analysis context.

    Instantiated once as a module-level singleton and reused across requests.
    """

    def __init__(self) -> None:
        provider = OpenRouterClient()
        self.gpt_service = GPTService(provider)
        logger.info("QuestionService initialized.")

    async def answer(
        self,
        eo_context: EOContext,
        question: str,
    ) -> tuple[Optional[str], Optional[str]]:
        """
        Generate a focused answer for a predefined EO question.

        Args:
            eo_context: Structured EO context from the completed /api/analyze run.
            question:   The predefined question string the user selected.

        Returns:
            Tuple of (answer_text, error_message).
            On success: (str, None).
            On failure: (None, str) — the error string is safe to surface to the UI.
        """
        if not question or not question.strip():
            return None, "Question must not be blank."

        logger.info(f"[QuestionService] Building prompt for question: '{question[:60]}...'")

        try:
            payload = prompt_builder.build_question_prompt(eo_context, question)
        except ValueError as e:
            logger.warning(f"[QuestionService] Prompt build failed: {e}")
            return None, "Invalid EO context — cannot generate insight."

        logger.info("[QuestionService] Calling GPT for question answer.")
        try:
            result = await self.gpt_service.generate_response(
                system_prompt=payload.system_prompt,
                user_prompt=payload.user_prompt,
            )
            answer = result.get("response", "").strip()
            if not answer:
                return None, "GPT returned an empty response."
            logger.info("[QuestionService] Answer received successfully.")
            return answer, None

        except Exception as e:
            logger.warning(f"[QuestionService] GPT call failed: {type(e).__name__}: {e}")
            return None, "Insight generation is temporarily unavailable."


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------
question_service = QuestionService()
