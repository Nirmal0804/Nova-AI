import os
import sys
import json
from PIL import Image, ImageDraw

# Ensure the root directory is on the path so we can resolve backend imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.vision.remoteclip import remoteclip_service
from backend.vision.inference import run_remoteclip_inference
from backend.utils.logger import logger

def make_dummy_satellite_image(path: str):
    """
    Creates a simple mock satellite image containing a mostly green (forest)
    area with a brown square (soil/desert) and a blue strip (water channel).
    """
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img = Image.new("RGB", (400, 400), color=(34, 139, 34)) # Forest green
    draw = ImageDraw.Draw(img)
    draw.rectangle([100, 100, 300, 200], fill=(210, 180, 140)) # Light brown sand
    draw.rectangle([0, 350, 400, 400], fill=(70, 130, 180)) # Blue river
    img.save(path)
    print(f"Dummy satellite image saved to {path}")

def main():
    image_path = "data/test_satellite.jpg"
    make_dummy_satellite_image(image_path)
    
    logger.info("Initializing offline RemoteCLIP pipeline...")
    
    # Pre-warm/load model
    try:
        remoteclip_service.load_model()
    except Exception as e:
        logger.error(f"Failed to load RemoteCLIP: {e}")
        sys.exit(1)

    # Validate image loading
    try:
        image = Image.open(image_path).convert("RGB")
    except Exception as e:
        logger.error(f"Failed to open test image: {e}")
        sys.exit(1)

    # Run inference
    logger.info("Triggering RemoteCLIP inference...")
    try:
        outputs = run_remoteclip_inference(image)
        print("\n=== REMOTECLIP INFERENCE REPORT ===")
        print(json.dumps(outputs, indent=2))
        print("===================================\n")
    except Exception as e:
        logger.error(f"Inference run failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
