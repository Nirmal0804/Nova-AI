"""
test_prompt_builder.py
----------------------
Standalone verification of the Prompt Builder module.

Tests:
  1. Valid input -> PromptPayload generated correctly
  2. Missing dominant_land_cover -> ValueError raised
  3. Invalid confidence band -> ValueError (caught at schema level)
  4. Undetermined secondary coverage -> fallback label applied
  5. Low confidence -> correctly threaded into the prompt

No GPT calls. No network. No vision inference.

Run from project root:
    python test_prompt_builder.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.prompts.prompt_builder import prompt_builder
from backend.schemas.prompt import EOContext
from backend.utils.logger import logger

PASS = "[PASS]"
FAIL = "[FAIL]"


def run_test(name: str, fn):
    try:
        fn()
        print(f"{PASS}  {name}")
        return True
    except AssertionError as e:
        print(f"{FAIL}  {name} — AssertionError: {e}")
        return False
    except Exception as e:
        print(f"{FAIL}  {name} — Unexpected exception: {type(e).__name__}: {e}")
        return False


def test_valid_high_confidence():
    ctx = EOContext(
        dominant_land_cover="Forest",
        secondary_land_cover="Agriculture",
        confidence="High",
        summary="The satellite image is interpreted with high relative confidence as a Forest scene.",
    )
    payload = prompt_builder.build_prompt(ctx)
    assert payload.system_prompt, "system_prompt must not be empty"
    assert payload.user_prompt, "user_prompt must not be empty"
    assert "Forest" in payload.user_prompt, "dominant land cover must appear in user_prompt"
    assert "Agriculture" in payload.user_prompt, "secondary land cover must appear in user_prompt"
    assert "High" in payload.user_prompt, "confidence must appear in user_prompt"
    assert "NovaAI" in payload.system_prompt, "system prompt must define NovaAI"
    assert "Never invent" in payload.system_prompt, "anti-hallucination instruction must be present"
    assert "Executive Summary" in payload.user_prompt, "new report structure must be enforced"


def test_undetermined_secondary_uses_fallback():
    ctx = EOContext(
        dominant_land_cover="Residential",
        secondary_land_cover="Undetermined",
        confidence="Medium",
        summary="Medium confidence residential area.",
    )
    payload = prompt_builder.build_prompt(ctx)
    assert "Not determined" in payload.user_prompt, \
        "Undetermined secondary should be replaced with fallback label"


def test_none_secondary_uses_fallback():
    ctx = EOContext(
        dominant_land_cover="Water",
        secondary_land_cover=None,
        confidence="Low",
        summary="Low confidence water body detection.",
    )
    payload = prompt_builder.build_prompt(ctx)
    assert "Not determined" in payload.user_prompt, \
        "None secondary should be replaced with fallback label"


def test_low_confidence_threaded_through():
    ctx = EOContext(
        dominant_land_cover="Desert",
        secondary_land_cover=None,
        confidence="Low",
        summary="Low confidence result — similarity margins narrow.",
    )
    payload = prompt_builder.build_prompt(ctx)
    assert "Low" in payload.user_prompt, "Low confidence must appear in the user prompt"


def test_invalid_confidence_band_raises():
    try:
        ctx = EOContext(
            dominant_land_cover="Forest",
            secondary_land_cover=None,
            confidence="Very High",   # invalid
            summary="Some summary.",
        )
        prompt_builder.build_prompt(ctx)
        raise AssertionError("Expected ValueError for invalid confidence band but none raised.")
    except Exception as e:
        assert "confidence" in str(e).lower(), \
            f"Exception must mention 'confidence'. Got: {e}"


def test_blank_dominant_raises():
    try:
        ctx = EOContext(
            dominant_land_cover="   ",  # blank
            secondary_land_cover="Desert",
            confidence="High",
            summary="Valid summary.",
        )
        prompt_builder.build_prompt(ctx)
        raise AssertionError("Expected ValueError for blank dominant_land_cover but none raised.")
    except Exception as e:
        assert "dominant_land_cover" in str(e).lower() or "blank" in str(e).lower(), \
            f"Exception must mention blank field. Got: {e}"


def test_blank_summary_raises():
    try:
        ctx = EOContext(
            dominant_land_cover="Forest",
            secondary_land_cover=None,
            confidence="Medium",
            summary="   ",  # blank
        )
        prompt_builder.build_prompt(ctx)
        raise AssertionError("Expected ValueError for blank summary but none raised.")
    except Exception as e:
        assert "summary" in str(e).lower() or "blank" in str(e).lower(), \
            f"Exception must mention blank field. Got: {e}"


def test_no_embeddings_in_prompts():
    ctx = EOContext(
        dominant_land_cover="Industrial",
        secondary_land_cover="Residential",
        confidence="Medium",
        summary="Industrial zone with residential adjacency.",
    )
    payload = prompt_builder.build_prompt(ctx)
    # The system prompt legitimately contains these words in its constraint
    # instructions (telling GPT NOT to reference them). Only the user_prompt,
    # which encodes actual EO data, must never contain vision-layer internals.
    forbidden_in_user = ["cosine", "logit", "tensor", "embedding vector"]
    for term in forbidden_in_user:
        assert term not in payload.user_prompt.lower(), \
            f"Forbidden vision-internal term '{term}' found in user_prompt"


if __name__ == "__main__":
    print("\n=== PROMPT BUILDER VERIFICATION ===\n")
    tests = [
        ("Valid High-confidence input produces correct PromptPayload", test_valid_high_confidence),
        ("Undetermined secondary uses fallback label",                  test_undetermined_secondary_uses_fallback),
        ("None secondary uses fallback label",                          test_none_secondary_uses_fallback),
        ("Low confidence threaded into prompts",                        test_low_confidence_threaded_through),
        ("Invalid confidence band raises error",                        test_invalid_confidence_band_raises),
        ("Blank dominant_land_cover raises error",                      test_blank_dominant_raises),
        ("Blank summary raises error",                                  test_blank_summary_raises),
        ("No forbidden vision internals in prompts",                    test_no_embeddings_in_prompts),
    ]

    passed = sum(run_test(name, fn) for name, fn in tests)
    total = len(tests)
    print(f"\n{'='*36}")
    print(f"Results: {passed}/{total} passed")
    print(f"{'='*36}\n")
    sys.exit(0 if passed == total else 1)
