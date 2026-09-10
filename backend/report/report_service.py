import time
from backend.utils.logger import logger
from backend.llm.openrouter import OpenRouterClient
from backend.config.settings import settings
from backend.report.schemas import ReportRequest, ReportResponse
from backend.report.claude_prompt_builder import ClaudePromptBuilder

class ReportService:
    def __init__(self):
        self.prompt_builder = ClaudePromptBuilder()
        
    async def generate_professional_report(self, request: ReportRequest) -> ReportResponse:
        logger.info("[ReportService] Report generation started")
        start_time = time.perf_counter()
        
        try:
            prompt_payload = self.prompt_builder.build_prompt(request)
            
            # Instantiate existing OpenRouterClient and override model
            client = OpenRouterClient()
            report_model = settings.REPORT_MODEL
            if not report_model:
                logger.warning("[ReportService] REPORT_MODEL not set. Ensure configuration is correct.")
                report_model = "anthropic/claude-3.5-sonnet"
                
            client.model = report_model
            
            logger.info(f"[ReportService] Claude request started using model: {report_model}")
            
            response = await client.generate_response(
                system_prompt=prompt_payload.system_prompt,
                user_prompt=prompt_payload.user_prompt
            )
            
            report_text = response.get("response", "Report unavailable")
            model = response.get("model", report_model)
            provider = response.get("provider", "OpenRouter")
            logger.info("[ReportService] Claude response received")
            
        except Exception as e:
            logger.error(f"[ReportService] Report generation failed: {str(e)}")
            report_text = "Report unavailable"
            model = getattr(settings, 'REPORT_MODEL', "unknown")
            provider = "OpenRouter (Error)"
            
        elapsed_time = time.perf_counter() - start_time
        logger.info(f"[ReportService] Generation completed in {elapsed_time:.2f}s")
        
        return ReportResponse(
            report=report_text,
            model=model if model else "unknown",
            provider=provider
        )

report_service = ReportService()
