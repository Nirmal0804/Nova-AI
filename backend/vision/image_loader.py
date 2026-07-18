import os
from PIL import Image
from io import BytesIO
from backend.utils.logger import logger

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tiff", ".tif"}
MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024  # 20MB limit
MIN_DIMENSION = 10
MAX_DIMENSION = 10000

def validate_and_load_image(file_bytes: bytes, filename: str) -> Image.Image:
    """
    Validates the content, size, extension, and dimensions of an uploaded file.
    Returns a PIL.Image instance.
    """
    # 1. Validate file extension
    ext = os.path.splitext(filename.lower())[1]
    if ext not in ALLOWED_EXTENSIONS:
        logger.error(f"Unsupported image format: {ext}")
        raise ValueError(f"Unsupported image format: {ext}. Safe formats: PNG, JPEG, TIFF")

    # 2. Validate empty size
    if not file_bytes or len(file_bytes) == 0:
        logger.error("Empty image file received.")
        raise ValueError("Image file is empty")

    if len(file_bytes) > MAX_IMAGE_SIZE_BYTES:
        logger.error(f"Image size exceeds limit: {len(file_bytes)} bytes")
        raise ValueError("Image size exceeds maximum limit of 20MB")

    # 3. Load PIL Image
    try:
        image = Image.open(BytesIO(file_bytes))
        # standard PIL trigger loading
        image.verify()
        
        # open again since verify() closes/invalidates the image object
        image = Image.open(BytesIO(file_bytes))
    except Exception as e:
        logger.error(f"Failed to open image file: {str(e)}")
        raise ValueError("Invalid or corrupted image file")

    # 4. Check dimensions
    width, height = image.size
    if width < MIN_DIMENSION or height < MIN_DIMENSION:
        logger.error(f"Image dimensions too small: {width}x{height}")
        raise ValueError(f"Image dimensions too small (min {MIN_DIMENSION}x{MIN_DIMENSION})")
        
    if width > MAX_DIMENSION or height > MAX_DIMENSION:
        logger.error(f"Image dimensions too massive: {width}x{height}")
        raise ValueError(f"Image dimensions too large (max {MAX_DIMENSION}x{MAX_DIMENSION})")

    # Convert grayscale, palette, or RGBA model to RGB because CLIP architecture works on RGB 3-channels
    if image.mode != "RGB":
        image = image.convert("RGB")
        
    logger.info(f"Image '{filename}' successfully validated and loaded. Size: {width}x{height}, Mode: {image.mode}")
    return image
