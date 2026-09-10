from pydantic import BaseModel
from typing import Optional
from backend.schemas.analysis import AnalysisResponse

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

class PDFReportRequest(BaseModel):
    analysis: AnalysisResponse
    image_base64: Optional[str] = None
