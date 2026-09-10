"""
eo_rules.py
-----------
All static EO domain knowledge lives here.
To add a new category: add an entry to EO_CATEGORY_KEYWORDS.
To adjust confidence bands: edit CONFIDENCE_THRESHOLDS.
Nothing in this file does computation — it is pure data.
"""

from typing import Dict, List

# ---------------------------------------------------------------------------
# EO Category Keyword Index
# ---------------------------------------------------------------------------
# Maps canonical EO category name → list of lowercase keywords that, if found
# anywhere in a tag string, map that tag to this category.
# Keywords are checked in order; first match wins.
# ---------------------------------------------------------------------------
EO_CATEGORY_KEYWORDS: Dict[str, List[str]] = {
    "Forest":       ["dense forest", "forest", "woodland", "tree canopy", "boreal", "tropical forest"],
    "Vegetation":   ["vegetation", "grassland", "shrubland", "shrub", "green cover", "savanna"],
    "Agriculture":  ["agricultural farmland", "agriculture", "agricultural", "farmland", "farm", "plantation"],
    "Annual Crop":  ["annual crop", "crop field", "cropland", "wheat", "rice field", "maize"],
    "Residential":  ["residential buildings and neighborhoods", "residential", "urban area", "buildings", "houses", "suburb", "settlement"],
    "Industrial":   ["industrial factories and warehouses", "industrial", "factory", "infrastructure", "warehouse", "logistics"],
    "Water":        ["river, lake, or ocean", "river", "lake", "ocean", "water body", "sea", "canal", "water", "waterway"],
    "Desert":       ["desert or barren land", "desert", "barren", "arid", "sand dune", "dry land"],
    "Flood":        ["flood", "flooded", "inundation", "waterlogged"],
    # Legacy fallbacks for compatibility
    "River":        ["river", "stream", "canal", "waterway"],
    "Water Body":   ["water body", "ocean", "lake", "sea", "reservoir", "pond", "bay"],
}

# ---------------------------------------------------------------------------
# Confidence Thresholds
# ---------------------------------------------------------------------------
# Based on the softmax confidence_score of the dominant label.
# These are RELATIVE bands — not statistical probabilities.
# ---------------------------------------------------------------------------
CONFIDENCE_THRESHOLDS = {
    "High":   0.55,   # confidence_score >= 0.55
    "Medium": 0.25,   # confidence_score >= 0.25 and < 0.55
    # Anything below 0.25 → "Low"
}

# ---------------------------------------------------------------------------
# Cosine Similarity Minimum
# ---------------------------------------------------------------------------
# Tags with cosine_similarity below this value are treated as noise and
# excluded from the EO context output entirely.
# ---------------------------------------------------------------------------
MIN_COSINE_SIMILARITY: float = 0.05

# ---------------------------------------------------------------------------
# Limitations
# ---------------------------------------------------------------------------
# Always included in every EO interpretation result.
# ---------------------------------------------------------------------------
STANDARD_LIMITATIONS: List[str] = [
    "Zero-shot semantic interpretation — no model fine-tuning on EO labels",
    "No pixel-level segmentation or object boundary detection",
    "No object counting or instance detection",
    "No temporal or change-detection analysis",
    "Interpretation is based solely on image-text similarity, not spectral analysis",
    "Performance may degrade on atypical viewpoints, cloud cover, or low-resolution inputs",
]

# ---------------------------------------------------------------------------
# Summary Templates
# ---------------------------------------------------------------------------
# Used by the interpreter to produce a human-readable summary sentence without GPT.
# Keys map to (dominant, secondary) tuple pattern → template.
# Fallback template used when no specific template matches.
# ---------------------------------------------------------------------------
SUMMARY_TEMPLATE_FALLBACK = (
    "RemoteCLIP analysis indicates a dominant land cover of {dominant} "
    "with secondary characteristics of {secondary} (relative confidence: {confidence}). "
    "This interpretation is based on zero-shot semantic similarity and carries inherent limitations."
)

SUMMARY_TEMPLATE_HIGH = (
    "The satellite image is interpreted with high relative confidence as a {dominant} scene. "
    "Secondary signals suggest the presence of {secondary}. "
    "Results reflect zero-shot image-text similarity scoring only."
)

SUMMARY_TEMPLATE_LOW = (
    "Interpretation confidence is low. The image most closely resembles {dominant}, "
    "though the similarity margins between categories are narrow. "
    "Results should be treated as indicative only."
)
