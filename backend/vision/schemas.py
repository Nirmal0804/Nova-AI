from pydantic import BaseModel
from typing import Dict, Any, List

class ImageInspectionResponse(BaseModel):
    model: str
    device: str
    output_summary: Dict[str, Any]
