"""
test_interpreter_cli.py
-----------------------
Standalone verification of the EO Interpretation Layer.
Does NOT start uvicorn. Does NOT use GPT.
Feeds the real RemoteCLIP output from test_inference_cli.py directly
into the interpreter and prints the structured EO context.

Run from project root:
    python test_interpreter_cli.py
"""

import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.interpreter.eo_schema import SimilarityEntry, EOInterpreterInput
from backend.interpreter.eo_interpreter import interpret
from backend.utils.logger import logger

# ---------------------------------------------------------------------------
# Simulate actual RemoteCLIP zero_shot_inspection output from a forest image
# (These values match what test_inference_cli.py produced in Phase 3)
# ---------------------------------------------------------------------------
MOCK_VISION_OUTPUT = {
    "model": "RemoteCLIP ViT-L-14",
    "device": "cpu",
    "zero_shot_inspection": [
        {
            "tag": "satellite imagery of forest",
            "cosine_similarity": 0.14446347951889038,
            "confidence_score": 0.6434618830680847
        },
        {
            "tag": "satellite imagery of desert",
            "cosine_similarity": 0.13409209251403809,
            "confidence_score": 0.22808626294136047
        },
        {
            "tag": "satellite imagery of agricultural land or crops",
            "cosine_similarity": 0.12018956989049911,
            "confidence_score": 0.05679633468389511
        },
        {
            "tag": "satellite imagery of water body or ocean",
            "cosine_similarity": 0.12183091044425964,
            "confidence_score": 0.0669272169470787
        },
        {
            "tag": "satellite imagery of urban area, buildings, or roads",
            "cosine_similarity": 0.0953303799033165,
            "confidence_score": 0.0047282385639846325
        }
    ]
}


def main():
    logger.info("=== EO Interpreter CLI Test ===")

    # Parse input
    entries = [SimilarityEntry(**e) for e in MOCK_VISION_OUTPUT["zero_shot_inspection"]]

    # Run interpreter
    try:
        result = interpret(
            similarity_entries=entries,
            vision_model=MOCK_VISION_OUTPUT["model"],
        )
    except ValueError as e:
        logger.error(f"Interpreter error: {e}")
        sys.exit(1)

    # Print structured result
    print("\n=== EO INTERPRETATION RESULT ===")
    print(json.dumps(result.model_dump(), indent=2))
    print("=================================\n")


if __name__ == "__main__":
    main()
