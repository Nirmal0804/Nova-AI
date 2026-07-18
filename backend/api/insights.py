"""
insights.py
-----------
POST /api/insights

Accepts a completed EO analysis context and a predefined question.
Returns a focused GPT-generated answer grounded in the EO context.

This endpoint does NOT re-run RemoteCLIP or the EO Interpreter.
It reuses the EOContext already produced by /api/analyze.

Error surface:
  - 400  Bad Request  — missing/invalid EO context or blank question
  - 503  Unavailable  — GPT failure (non-fatal to the existing report)
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional

from backend.schemas.prompt import EOContext
from backend.services.question_service import question_service
from backend.utils.logger import logger

router = APIRouter(prefix="/api", tags=["Insights"])


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class InsightRequest(BaseModel):
    """Payload for POST /api/insights."""
    eo_context: EOContext = Field(
        ...,
        description="The EO context produced by the completed /api/analyze run."
    )
    question: str = Field(
        ...,
        min_length=3,
        description="The predefined question string the user selected."
    )


class InsightResponse(BaseModel):
    """Response from POST /api/insights."""
    answer: str = Field(..., description="GPT-generated answer grounded in the EO context.")
    question: str = Field(..., description="The original question that was answered.")


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

@router.post(
    "/insights",
    response_model=InsightResponse,
    summary="Quick EO Insight — answer a predefined question",
    description=(
        "Accepts the completed EO analysis context and a predefined question. "
        "Returns a concise, context-grounded answer without re-running RemoteCLIP."
    ),
)
async def get_insight(request: InsightRequest) -> InsightResponse:
    """
    POST /api/insights — predefined EO question answering.

    Delegates to QuestionService which builds a grounded prompt and
    queries GPT-OSS via OpenRouterClient. No vision model is re-invoked.
    """
    logger.info(
        f"[/api/insights] Request received. "
        f"Dominant: '{request.eo_context.dominant_land_cover}'. "
        f"Question: '{request.question[:60]}...'"
    )

    answer, error = await question_service.answer(
        eo_context=request.eo_context,
        question=request.question,
    )

    if error:
        logger.warning(f"[/api/insights] Failed to generate answer: {error}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=error,
        )

    logger.info("[/api/insights] Answer generated successfully.")
    return InsightResponse(answer=answer, question=request.question)
