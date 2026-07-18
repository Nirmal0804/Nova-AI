import torch
import time
from PIL import Image
from typing import Dict, Any
from backend.vision.remoteclip import remoteclip_service
from backend.vision.preprocessing import preprocess_image
from backend.utils.logger import logger

from backend.vision.labels import ZERO_SHOT_LABELS

CANDIDATE_TAGS = ZERO_SHOT_LABELS

def run_remoteclip_inference(image: Image.Image) -> Dict[str, Any]:
    """
    Runs inference on the provided PIL image using RemoteCLIP.
    Computes visual feature embeddings, extracts stats, and runs zero-shot
    similarity scans against test remote sensing captions for verification.
    """
    # 1. Ensure model is loaded
    if remoteclip_service.model is None:
        logger.info("RemoteCLIP model not loaded yet. Bootstrapping...")
        remoteclip_service.load_model()

    model = remoteclip_service.model
    preprocess = remoteclip_service.preprocess
    tokenizer = remoteclip_service.tokenizer
    device = remoteclip_service.device

    # 2. Preprocess image
    start_time = time.time()
    input_tensor = preprocess_image(image, preprocess).to(device)
    
    # 3. Model execution
    logger.info("Running RemoteCLIP visual encoder inference...")
    inference_start = time.time()
    with torch.no_grad():
        # Encode image features
        image_features = model.encode_image(input_tensor)
        
        # Calculate stats of raw embedding
        raw_mean = float(image_features.mean().cpu().item())
        raw_std = float(image_features.std().cpu().item())
        embedding_shape = list(image_features.shape)
        
        # L2 Normalize
        normalized_image_features = torch.nn.functional.normalize(image_features, dim=-1)
        
        # Encode text tags for zero-shot inspection
        text_tokens = tokenizer(CANDIDATE_TAGS).to(device)
        text_features = model.encode_text(text_tokens)
        normalized_text_features = torch.nn.functional.normalize(text_features, dim=-1)
        
        # Compute cosine similarities and soft probabilities
        # Shape: (5,)
        similarities = (normalized_image_features @ normalized_text_features.T).squeeze(0)
        
        # OpenCLIP uses a logit scale dynamically. Let's use standard cosine similarity
        cosine_scores = similarities.cpu().tolist()
        
        # Calculate soft probabilities (standard CLIP scaling factor of 100)
        probabilities = (similarities * 100.0).softmax(dim=-1).cpu().tolist()

    inference_time_ms = (time.time() - inference_start) * 1000
    total_time_ms = (time.time() - start_time) * 1000
    logger.info(f"RemoteCLIP inference completed in {inference_time_ms:.2f}ms. Total pipeline: {total_time_ms:.2f}ms.")

    # Convert embedding sample to standard python list (first 10 floats)
    embedding_sample = image_features.squeeze(0)[:10].cpu().tolist()

    return {
        "embedding_shape": embedding_shape,
        "embedding_sample_first_10": embedding_sample,
        "embeddings_stats": {
            "mean": raw_mean,
            "std": raw_std,
            "l2_norm": float(torch.norm(image_features, p=2).cpu().item())
        },
        "zero_shot_inspection": [
            {
                "tag": CANDIDATE_TAGS[i],
                "cosine_similarity": cosine_scores[i],
                "confidence_score": probabilities[i]
            }
            for i in range(len(CANDIDATE_TAGS))
        ],
        "performance": {
            "inference_time_ms": inference_time_ms,
            "total_time_ms": total_time_ms
        }
    }
