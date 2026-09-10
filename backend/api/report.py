import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from backend.report.schemas import PDFReportRequest
from backend.report.pdf_generator import pdf_generator
from backend.utils.logger import logger

router = APIRouter(prefix="/api/report", tags=["report"])

@router.post("/pdf")
async def generate_pdf(request: PDFReportRequest):
    """
    Generate a professional PDF report from an existing AnalysisResponse.
    Does not re-run GPT or vision inference.
    """
    try:
        pdf_bytes = pdf_generator.generate_pdf(
            analysis=request.analysis,
            image_base64=request.image_base64
        )
        
        timestamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"NovaAI_Report_{timestamp}.pdf"
        
        headers = {
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers=headers
        )
        
    except Exception as e:
        logger.error(f"PDF Endpoint failed: {str(e)}")
        raise HTTPException(status_code=500, detail="PDF generation failed.")
