from fastapi import APIRouter, Query
from typing import List
from app.services.open_meteo import OpenMeteoService
from app.schemas.weather import GeoLocation

router = APIRouter(prefix="/geo", tags=["geocoding"])

@router.get("/search", response_model=List[GeoLocation])
async def search_places(
    q: str = Query(..., min_length=2, description="Place or city name (e.g. Madurai, Chennai)"),
    count: int = Query(6, ge=1, le=20)
):
    return await OpenMeteoService.search_places(q, count=count)

