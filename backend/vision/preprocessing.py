import torch
from PIL import Image
from typing import Any
from backend.utils.logger import logger

def preprocess_image(image: Image.Image, transform: Any) -> torch.Tensor:
    """
    Applies RemoteCLIP's configured open_clip preprocessor to a PIL image.
    Adds a batch dimension, converting PIL.Image to Shape: (1, 3, 224, 224).
    """
    logger.info("Applying RemoteCLIP preprocessing pipeline to PIL image.")
    try:
        tensor = transform(image)
        # Add batch dimension: (3, 224, 224) -> (1, 3, 224, 224)
        tensor = tensor.unsqueeze(0)
        return tensor
    except Exception as e:
        logger.error(f"Error during preprocessing: {str(e)}")
        raise ValueError(f"Preprocessing transform failed: {str(e)}")
