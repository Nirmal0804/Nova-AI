from fastapi import APIRouter, HTTPException, status
from backend.interpreter.eo_schema import EOInterpreterInput, EOInterpretation
from backend.interpreter.eo_interpreter import interpret
from backend.utils.logger import logger

router = APIRouter(prefix="/api/interpreter", tags=["EO Interpreter"])


@router.post("/test", response_model=EOInterpretation)
async def test_interpreter(payload: EOInterpreterInput):
    """
    Transforms RemoteCLIP zero-shot similarity outputs into structured
    Earth Observation context.

    Input: The `zero_shot_inspection` list from the vision service output.
    Output: Structured EO context — dominant/secondary land cover, ranked
            EO concepts, relative confidence, limitations, and summary.

    Constraints:
      - No GPT involvement.
      - No fabrication — only summarises what similarity scores support.
      - Deterministic and stateless.
    """
    logger.info(
        f"/api/interpreter/test called. "
        f"Entries received: {len(payload.zero_shot_inspection)}. "
        f"Vision model: {payload.model or 'not specified'}."
    )

    try:
        result = interpret(
            similarity_entries=payload.zero_shot_inspection,
            vision_model=payload.model,
        )
        return result

    except ValueError as e:
        logger.warning(f"Interpreter rejected input: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Unexpected error in interpreter: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="EO interpretation failed due to an internal error.",
        )
