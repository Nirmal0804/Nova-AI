import io
import time
from backend.utils.logger import logger
from xhtml2pdf import pisa
from backend.schemas.analysis import AnalysisResponse
from backend.report.html_renderer import html_renderer

class PDFGenerator:
    def generate_pdf(self, analysis: AnalysisResponse, image_base64: str = None) -> bytes:
        logger.info("[PDFGenerator] PDF generation started")
        start_time = time.perf_counter()
        
        try:
            # 1. Render HTML
            html_content = html_renderer.render(analysis, image_base64)
            logger.info("[PDFGenerator] HTML rendering completed")
            
            # 2. Convert HTML to PDF
            pdf_out = io.BytesIO()
            pisa_status = pisa.CreatePDF(
                src=html_content,
                dest=pdf_out,
                encoding='utf-8'
            )
            
            if pisa_status.err:
                raise RuntimeError("xhtml2pdf encountered an error formatting the PDF.")
                
            pdf_bytes = pdf_out.getvalue()
            
            elapsed = time.perf_counter() - start_time
            logger.info(f"[PDFGenerator] PDF generation completed in {elapsed:.2f}s")
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"[PDFGenerator] Error generating PDF: {str(e)}")
            raise

pdf_generator = PDFGenerator()
