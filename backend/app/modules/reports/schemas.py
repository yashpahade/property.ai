from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any

class ReportFilter(BaseModel):
    city: Optional[str] = None
    locality: Optional[str] = None
    report_type: str # 'pdf' or 'excel'
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    model_config = ConfigDict(from_attributes=True)

class ReportExportResponse(BaseModel):
    download_url: str
    status: str
