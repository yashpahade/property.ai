from fastapi import APIRouter
from app.modules.reports import schemas, service

router = APIRouter()

@router.post("/export", response_model=schemas.ReportExportResponse)
async def export_reports(filters: schemas.ReportFilter):
    return await service.export_report(filters)
