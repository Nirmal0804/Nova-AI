from pydantic import BaseModel
from typing import Optional

class ReportRequest(BaseModel):
    dominant_land_cover: str
    secondary_land_cover: Optional[str] = None
    confidence: str
    summary: str
    gpt_analysis: str

class ReportResponse(BaseModel):
    report: str
    model: str
    provider: str
