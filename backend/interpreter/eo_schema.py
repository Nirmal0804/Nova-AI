"""
eo_schema.py
------------
Pydantic input and output schemas for the EO Interpretation Layer.

Input  → EOInterpreterInput  (the zero_shot_inspection from the vision service)
Output → EOInterpretation    (structured EO context)
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional


# ---------------------------------------------------------------------------
# Sub-models
# ---------------------------------------------------------------------------

class SimilarityEntry(BaseModel):
    """One entry from RemoteCLIP's zero_shot_inspection list."""
    tag: str
    cosine_similarity: float
    confidence_score: float


class RankedEOConcept(BaseModel):
    """A single ranked EO concept as returned in top_matches."""
    rank: int
    eo_category: str         # Canonical EO category name (from eo_rules)
    original_tag: str        # Raw tag string from RemoteCLIP
    cosine_similarity: float
    confidence_score: float


# ---------------------------------------------------------------------------
# Request schema
# ---------------------------------------------------------------------------

class EOInterpreterInput(BaseModel):
    """
    Payload sent to POST /api/interpreter/test.
    Mirrors the structure returned by the vision service.
    Only `zero_shot_inspection` is required; other fields are passed through
    as metadata for logging and provenance.
    """
    zero_shot_inspection: List[SimilarityEntry] = Field(
        ...,
        description="Similarity scores from RemoteCLIP zero-shot inspection",
        min_length=1,
    )
    model: Optional[str] = Field(None, description="Vision model identifier (pass-through)")
    device: Optional[str] = Field(None, description="Inference device (pass-through)")

    @field_validator("zero_shot_inspection")
    @classmethod
    def must_have_tags(cls, v):
        if not v:
            raise ValueError("zero_shot_inspection must contain at least one entry")
        for entry in v:
            if not entry.tag or not entry.tag.strip():
                raise ValueError("Each similarity entry must have a non-empty tag")
        return v


# ---------------------------------------------------------------------------
# Response schema
# ---------------------------------------------------------------------------

class EOInterpretation(BaseModel):
    """
    Structured EO context produced by the interpretation layer.
    This is the complete response from POST /api/interpreter/test.
    """
    dominant_land_cover: str = Field(
        ...,
        description="The highest-ranked EO land cover category"
    )
    secondary_land_cover: str = Field(
        ...,
        description="The second-ranked EO land cover category, or 'Undetermined' if unavailable"
    )
    top_matches: List[RankedEOConcept] = Field(
        ...,
        description="All matched EO concepts ranked by cosine similarity (descending)"
    )
    relative_confidence: str = Field(
        ...,
        description="Qualitative confidence band: High | Medium | Low"
    )
    limitations: List[str] = Field(
        ...,
        description="Known limitations of this interpretation method"
    )
    summary: str = Field(
        ...,
        description="Human-readable interpretation summary (no GPT)"
    )
    # Provenance
    vision_model: Optional[str] = Field(None, description="Source vision model")
    interpretation_time_ms: Optional[float] = Field(None, description="Interpreter execution time in ms")
