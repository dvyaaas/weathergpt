from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.services.open_meteo import OpenMeteoService
from app.schemas.weather import WeatherForecastResponse, GeoLocation

router = APIRouter(prefix="/weather", tags=["weather"])

@router.get("/forecast", response_model=WeatherForecastResponse)
async def get_forecast(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    name: Optional[str] = Query(None, description="Location name"),
    admin1: Optional[str] = Query(None, description="State/Province")
):
    try:
        loc = GeoLocation(
            name=name or f"{lat:.2f}, {lon:.2f}",
            latitude=lat,
            longitude=lon,
            admin1=admin1,
            country="India",
            country_code="IN"
        )
        return await OpenMeteoService.get_weather(lat, lon, location=loc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch forecast: {str(e)}")

@router.get("/current")
async def get_current(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    name: Optional[str] = Query(None, description="Location name")
):
    try:
        weather_resp = await OpenMeteoService.get_weather(lat, lon)
        return {
            "location": name or f"{lat:.2f}, {lon:.2f}",
            "current": weather_resp.current,
            "source": weather_resp.source,
            "timestamp": weather_resp.timestamp
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch current weather: {str(e)}")

