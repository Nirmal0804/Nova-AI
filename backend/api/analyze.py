"""
analyze.py
----------
Production endpoint: POST /api/analyze

Accepts a satellite image upload and orchestrates the full EO analysis pipeline:
  Image → RemoteCLIP → EO Interpreter → Prompt Builder → GPT → AnalysisResponse

Error surface:
  - 400  Bad Request    — invalid file type, corrupted image, empty upload
  - 422  Unprocessable  — image passes format check but produces no valid EO context
  - 500  Server Error   — RemoteCLIP model failure or unexpected exception
  - 200  partial_success — vision + EO succeed but GPT fails (non-fatal)
"""

import time
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from backend.schemas.analysis import AnalysisResponse
from backend.services.analysis_service import analysis_service
from backend.utils.logger import logger

router = APIRouter(prefix="/api", tags=["Analysis"])

# Maximum acceptable file size (enforced here as a fast-path guard before
# bytes are read into memory; image_loader also validates internally).
_MAX_UPLOAD_BYTES = 20 * 1024 * 1024  # 20 MB


@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    summary="Earth Observation Image Analysis",
    description=(
        "Upload a satellite image (PNG / JPEG / TIFF). "
        "Returns a comprehensive EO analysis including land-cover classification, "
        "EO scene interpretation, and a GPT-generated analyst report."
    ),
)
async def analyze_image(image: UploadFile = File(...)) -> AnalysisResponse:
    """
    POST /api/analyze — production EO analysis endpoint.

    Validates the uploaded image, runs the complete pipeline, and returns
    a structured AnalysisResponse. GPT failure produces a partial_success
    response rather than an error; vision analysis is always returned.
    """
    request_start = time.perf_counter()
    logger.info(
        f"[/api/analyze] Request received. "
        f"Filename: '{image.filename}', Content-Type: {image.content_type}."
    )

    # ------------------------------------------------------------------
    # 1. Read upload stream
    # ------------------------------------------------------------------
    try:
        image_bytes = await image.read()
    except Exception as e:
        logger.error(f"[/api/analyze] Failed to read upload stream: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to read the uploaded file. Ensure the request is multipart/form-data.",
        )

    if not image_bytes:
        logger.warning("[/api/analyze] Empty file received.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if len(image_bytes) > _MAX_UPLOAD_BYTES:
        logger.warning(f"[/api/analyze] File too large: {len(image_bytes)} bytes.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image exceeds the maximum allowed size of 20 MB.",
        )

    logger.info(f"[/api/analyze] File received. Size: {len(image_bytes):,} bytes.")

    # ------------------------------------------------------------------
    # 2. Run analysis pipeline (delegates to AnalysisService)
    # ------------------------------------------------------------------
    try:
        result = await analysis_service.analyze_image(
            image_bytes=image_bytes,
            filename=image.filename or "upload.jpg",
        )

    except ValueError as e:
        # Validation or EO interpretation failure — client error
        logger.warning(f"[/api/analyze] Validation / interpretation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    except RuntimeError as e:
        # RemoteCLIP model loading failure — server error
        logger.error(f"[/api/analyze] RemoteCLIP model failure: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Vision model error: {e}",
        )

    except Exception as e:
        # Unexpected exception — log and return generic 500
        logger.error(f"[/api/analyze] Unexpected pipeline error: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during analysis. Please try again.",
        )

    total_ms = (time.perf_counter() - request_start) * 1000
    logger.info(
        f"[/api/analyze] Response sent. "
        f"Status={result.status}, "
        f"Dominant={result.dominant_land_cover}, "
        f"Total={total_ms:.0f}ms."
    )
    return result
