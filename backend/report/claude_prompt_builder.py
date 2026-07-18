from pydantic import BaseModel
from backend.report.templates import REPORT_SYSTEM_PROMPT, REPORT_USER_PROMPT
from backend.report.schemas import ReportRequest

class ReportPromptPayload(BaseModel):
    system_prompt: str
    user_prompt: str

class ClaudePromptBuilder:
    def build_prompt(self, request: ReportRequest) -> ReportPromptPayload:
        user_prompt = REPORT_USER_PROMPT.format(
            dominant_land_cover=request.dominant_land_cover,
            secondary_land_cover=request.secondary_land_cover or "None",
            confidence=request.confidence,
            summary=request.summary,
            gpt_analysis=request.gpt_analysis
        )
        return ReportPromptPayload(
            system_prompt=REPORT_SYSTEM_PROMPT,
            user_prompt=user_prompt
        )
