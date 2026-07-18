"""
test_production_pipeline.py
---------------------------
End-to-end integration test suite for the NovaAI Phase 5 production pipeline.

Verifies:
  1. GET /health is functional
  2. POST /api/chat/test is functional
  3. POST /api/vision/test is functional
  4. POST /api/interpreter/test is functional
  5. POST /api/analyze accepts satellite image uploads and works end-to-end
  6. Response model matches the production schema (status, dominant_land_cover, confidence, summary, gpt_analysis, metadata)
  7. No internal debugging values (embeddings, similarities) are leaked in POST /api/analyze responses
  8. Non-fatal GPT failure handler returns HTTP 200 partial_success instead of crashing
"""

import sys
import os
import requests
import json
from PIL import Image, ImageDraw

URL_HEALTH = "http://127.0.0.1:8000/health"
URL_CHAT_TEST = "http://127.0.0.1:8000/api/chat/test"
URL_VISION_TEST = "http://127.0.0.1:8000/api/vision/test"
URL_INTERPRETER_TEST = "http://127.0.0.1:8000/api/interpreter/test"
URL_ANALYZE = "http://127.0.0.1:8000/api/analyze"

IMAGE_PATH = "data/test_satellite.jpg"


def setup_dummy_image():
    """Ensure a dummy forest satellite image is present for inspection."""
    os.makedirs(os.path.dirname(IMAGE_PATH), exist_ok=True)
    img = Image.new("RGB", (400, 400), color=(34, 139, 34)) # Forest green
    draw = ImageDraw.Draw(img)
    draw.rectangle([100, 100, 300, 200], fill=(210, 180, 140)) # sand
    draw.rectangle([0, 350, 400, 400], fill=(70, 130, 180)) # water
    img.save(IMAGE_PATH)


def test_health():
    print("Testing GET /health...")
    r = requests.get(URL_HEALTH)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert data["status"] == "success"
    print("  -> Passed health check.")


def test_chat_test():
    print("Testing POST /api/chat/test...")
    r = requests.post(URL_CHAT_TEST, json={"message": "ping"})
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert "response" in data
    assert "model" in data
    assert "provider" in data
    print(f"  -> Passed chat test. Model: {data['model']}")


def test_vision_test():
    print("Testing POST /api/vision/test...")
    with open(IMAGE_PATH, "rb") as f:
        r = requests.post(URL_VISION_TEST, files={"file": f})
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert "output_summary" in data
    summary = data["output_summary"]
    assert "embedding_shape" in summary
    assert "zero_shot_inspection" in summary
    print("  -> Passed vision test.")


def test_interpreter_test():
    print("Testing POST /api/interpreter/test...")
    payload = {
        "model": "RemoteCLIP ViT-L-14",
        "device": "cpu",
        "zero_shot_inspection": [
            {
                "tag": "satellite imagery of dense forest",
                "cosine_similarity": 0.165,
                "confidence_score": 0.92
            },
            {
                "tag": "satellite imagery of river, lake, or ocean",
                "cosine_similarity": 0.08,
                "confidence_score": 0.05
            }
        ]
    }
    r = requests.post(URL_INTERPRETER_TEST, json=payload)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert data["dominant_land_cover"] == "Forest"
    assert data["secondary_land_cover"] == "Water"
    assert data["relative_confidence"] == "High"
    print("  -> Passed interpreter test.")


def test_analyze_production_ok():
    print("Testing POST /api/analyze (valid flow)...")
    with open(IMAGE_PATH, "rb") as f:
        r = requests.post(URL_ANALYZE, files={"image": f})
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    
    print("\n--- PRODUCTION ANALYSIS RESPONSE ---")
    print(json.dumps(data, indent=2))
    print("------------------------------------\n")

    # Schema validation
    assert "status" in data
    assert data["status"] in ("success", "partial_success")
    assert "dominant_land_cover" in data
    assert data["dominant_land_cover"] == "Forest"  # dummy image has forest green background (34,139,34)
    assert "secondary_land_cover" in data
    assert "confidence" in data
    assert "summary" in data
    assert "gpt_analysis" in data
    
    # Metadata assertion
    assert "metadata" in data
    meta = data["metadata"]
    assert "vision_model" in meta
    assert "llm_model" in meta
    assert "processing_time_ms" in meta
    assert "timestamp" in meta
    assert meta["version"] == "1.0"

    # Absolute non-leak validation
    forbidden = ["embedding_shape", "embedding_sample_first_10", "cosine_similarity", "zero_shot_inspection", "cosine_scores"]
    for field in forbidden:
        assert field not in data, f"Security Alert: Internal debug field '{field}' leaked into production response!"
        assert field not in meta, f"Security Alert: Internal debug field '{field}' leaked into metadata!"

    print("  -> Passed production analysis schema check & sanitization check.")


def test_analyze_gpt_failure_handling():
    print("Testing POST /api/analyze with mock LLM failure...")
    # To test non-fatal GPT failure gracefully without breaking existing config, we can
    # test by posting an empty or invalid authorization scheme inside FastAPI or we can force-simulate
    # this using a short python request where we can mock GPTService.generate_response.
    # Let's run a separate Python script that imports AnalysisService and mocks OpenRouterClient responses,
    # demonstrating that analyze_image() returns partial_success with vision results intact!
    
    import asyncio
    
    # Setup test case
    async def run_mock_check():
        from backend.services.analysis_service import AnalysisService
        service = AnalysisService()
        
        # Mock GPTService to raise an Exception
        async def mock_generate(*args, **kwargs):
            raise RuntimeError("OpenRouter API is down (simulated).")
        service.gpt_service.generate_response = mock_generate
        
        with open(IMAGE_PATH, "rb") as f:
            bytes_data = f.read()
            
        res = await service.analyze_image(bytes_data, "test.jpg")
        print("\n--- SIMULATED GPT-FAILURE RESPONSE ---")
        print(res.model_dump_json(indent=2))
        print("--------------------------------------\n")
        
        assert res.status == "partial_success", "Expected 'partial_success' status"
        assert res.gpt_analysis is None, "Expected gpt_analysis to be null (None)"
        assert res.warning == "LLM analysis unavailable.", "Expected warning message"
        assert res.dominant_land_cover == "Forest", "Vision components must still succeed"
        assert res.metadata.vision_model is not None, "Vision metadata should still be present"

    loop = asyncio.get_event_loop()
    loop.run_until_complete(run_mock_check())
    print("  -> Passed GPT failure handling test case.")


def main():
    setup_dummy_image()
    try:
        test_health()
        test_chat_test()
        test_vision_test()
        test_interpreter_test()
        test_analyze_production_ok()
        test_analyze_gpt_failure_handling()
        print("\nALL PIPELINE INTEGRATION TESTS PASSED SUCCESSFULLY!\n")
        sys.exit(0)
    except AssertionError as e:
        print(f"\nTEST SUITE FAILED assertion: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\nTEST SUITE FAILED with error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
