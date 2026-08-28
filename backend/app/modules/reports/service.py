from app.modules.reports.schemas import ReportFilter

async def export_report(filters: ReportFilter) -> dict:
    # Mocking the export functionality
    # In a real scenario, this would trigger an async task (e.g. Celery) to generate the report
    
    file_ext = "pdf" if filters.report_type == "pdf" else "xlsx"
    mock_url = f"https://cdn.props.ai/reports/mock_report_{filters.city or 'all'}.{file_ext}"
    
    return {
        "download_url": mock_url,
        "status": "ready"
    }
