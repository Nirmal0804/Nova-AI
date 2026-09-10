from fastapi import APIRouter, File, UploadFile, HTTPException, status
from backend.vision.image_loader import validate_and_load_image
from backend.vision.inference import run_remoteclip_inference
from backend.vision.remoteclip import remoteclip_service
from backend.vision.schemas import ImageInspectionResponse
from backend.utils.logger import logger

router = APIRouter(prefix="/api/vision", tags=["Vision"])

@router.post("/test", response_model=ImageInspectionResponse)
async def test_vision(file: UploadFile = File(...)):
    """
    Exposes an inspection endpoint to run RemoteCLIP inference on an uploaded image.
    Validates the image file, executes the preprocessing + encoder pipeline,
    and returns a summary of the model outputs.
    """
    logger.info(f"Received request on /api/vision/test. Filename: {file.filename}")
    
    # 1. Read file bytes
    try:
        content = await file.read()
    except Exception as e:
        logger.error(f"Failed to read upload stream: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to read uploaded file stream."
        )

    # 2. Validate and load PIL image using unified loader
    try:
        pil_image = validate_and_load_image(content, file.filename)
    except ValueError as e:
        logger.error(f"Image validation rejected: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # 3. Ensure RemoteCLIP model is loaded, fallback to CPU if needed
    try:
        if remoteclip_service.model is None:
            logger.info("RemoteCLIP singleton not loaded. Initializing now...")
            remoteclip_service.load_model()
    except RuntimeError as e:
        logger.error(f"RemoteCLIP model loading failure: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model checkpoint loading failure: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected loader error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while configuring the vision model."
        )

    # 4. Execute inference
    try:
        logger.info("Executing RemoteCLIP inference wrapper...")
        inference_results = run_remoteclip_inference(pil_image)
        logger.info("Inference completed successfully.")
        
        return ImageInspectionResponse(
            model=f"RemoteCLIP {remoteclip_service.model_name}",
            device=remoteclip_service.device,
            output_summary=inference_results
        )
        
    except torch.cuda.OutOfMemoryError as e:
        logger.critical(f"CUDA Out of Memory occurred during inference: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GPU Server ran out of memory during model inference."
        )
    except Exception as e:
        logger.error(f"Inference pipeline execution failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model inference failed: {str(e)}"
        )
