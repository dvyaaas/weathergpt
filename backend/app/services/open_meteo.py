import httpx
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from app.config import settings
from app.schemas.weather import (
    GeoLocation,
    CurrentWeather,
    HourlyForecastItem,
    DailyForecastItem,
    WeatherForecastResponse,
)

# WMO Weather interpretation codes (WW)
WMO_CODE_MAP = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    62: "Moderate rain",
    63: "Heavy rain",
    65: "Heavy rain shower",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm: Slight or moderate",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}

def decode_wmo_code(code: int) -> str:
    return WMO_CODE_MAP.get(code, "Cloudy / Variable")

class OpenMeteoService:
    @staticmethod
    async def search_places(query: str, count: int = 5) -> List[GeoLocation]:
        """Search Indian or global places using Open-Meteo Geocoding API."""
        if not query or len(query.strip()) < 2:
            return []
            
        params = {
            "name": query.strip(),
            "count": count,
            "language": "en",
            "format": "json"
        }
        
        async with httpx.AsyncClient(timeout=8.0) as client:
            try:
                response = await client.get(settings.OPEN_METEO_GEOCODING_URL, params=params)
                if response.status_code != 200:
                    return []
                data = response.json()
                results = data.get("results", [])
                
                # Sort to prioritize Indian places if query matches multiple countries
                results.sort(key=lambda x: 0 if x.get("country_code") == "IN" else 1)
                
                locations = []
                for item in results:
                    locations.append(
                        GeoLocation(
                            id=item.get("id"),
                            name=item.get("name"),
                            latitude=item.get("latitude"),
                            longitude=item.get("longitude"),
                            elevation=item.get("elevation"),
                            country_code=item.get("country_code"),
                            admin1=item.get("admin1"),
                            country=item.get("country"),
                            timezone=item.get("timezone", "Asia/Kolkata"),
                        )
                    )
                return locations
            except Exception as e:
                print(f"Error fetching geocoding data: {e}")
                return []

    @staticmethod
    async def get_weather(lat: float, lon: float, location: Optional[GeoLocation] = None) -> WeatherForecastResponse:
        """Fetch current and forecast weather from Open-Meteo API."""
        now_iso = datetime.now(timezone.utc).isoformat()
        
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "is_day",
                "precipitation",
                "rain",
                "weather_code",
                "surface_pressure",
                "wind_speed_10m",
                "wind_direction_10m"
            ],
            "hourly": [
                "temperature_2m",
                "relative_humidity_2m",
                "precipitation_probability",
                "precipitation",
                "weather_code",
                "wind_speed_10m"
            ],
            "daily": [
                "weather_code",
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_sum",
                "precipitation_probability_max",
                "wind_speed_10m_max"
            ],
            "timezone": location.timezone if location and location.timezone else "Asia/Kolkata",
            "forecast_days": 7
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(settings.OPEN_METEO_FORECAST_URL, params=params)
            response.raise_for_status()
            data = response.json()
            
        current_data = data.get("current", {})
        hourly_data = data.get("hourly", {})
        daily_data = data.get("daily", {})
        
        # Build CurrentWeather
        weather_code = current_data.get("weather_code", 0)
        current = CurrentWeather(
            temperature=current_data.get("temperature_2m", 0.0),
            apparent_temperature=current_data.get("apparent_temperature", 0.0),
            relative_humidity=current_data.get("relative_humidity_2m", 0),
            is_day=current_data.get("is_day", 1),
            precipitation=current_data.get("precipitation", 0.0),
            rain=current_data.get("rain", 0.0),
            weather_code=weather_code,
            weather_description=decode_wmo_code(weather_code),
            surface_pressure=current_data.get("surface_pressure", 1013.25),
            wind_speed=current_data.get("wind_speed_10m", 0.0),
            wind_direction=current_data.get("wind_direction_10m", 0),
            time=current_data.get("time", now_iso),
            source="Open-Meteo Forecast API (ECMWF/GFS)",
            fetched_at=now_iso
        )
        
        # Build Hourly list (next 24 hours)
        hourly_times = hourly_data.get("time", [])[:24]
        hourly_items: List[HourlyForecastItem] = []
        for i, t in enumerate(hourly_times):
            code = hourly_data.get("weather_code", [0])[i]
            hourly_items.append(
                HourlyForecastItem(
                    time=t,
                    temperature=hourly_data.get("temperature_2m", [0.0])[i],
                    relative_humidity=hourly_data.get("relative_humidity_2m", [0])[i],
                    precipitation_probability=hourly_data.get("precipitation_probability", [0])[i] or 0,
                    precipitation=hourly_data.get("precipitation", [0.0])[i] or 0.0,
                    weather_code=code,
                    weather_description=decode_wmo_code(code),
                    wind_speed=hourly_data.get("wind_speed_10m", [0.0])[i]
                )
            )
            
        # Build Daily list (7 days)
        daily_dates = daily_data.get("time", [])
        daily_items: List[DailyForecastItem] = []
        for i, d in enumerate(daily_dates):
            code = daily_data.get("weather_code", [0])[i]
            daily_items.append(
                DailyForecastItem(
                    date=d,
                    weather_code=code,
                    weather_description=decode_wmo_code(code),
                    temperature_max=daily_data.get("temperature_2m_max", [0.0])[i],
                    temperature_min=daily_data.get("temperature_2m_min", [0.0])[i],
                    precipitation_sum=daily_data.get("precipitation_sum", [0.0])[i] or 0.0,
                    precipitation_probability_max=daily_data.get("precipitation_probability_max", [0])[i] or 0,
                    wind_speed_max=daily_data.get("wind_speed_10m_max", [0.0])[i]
                )
            )
            
        loc = location or GeoLocation(
            name=f"{lat:.2f}, {lon:.2f}",
            latitude=lat,
            longitude=lon,
            country="India",
            country_code="IN",
            timezone="Asia/Kolkata"
        )
        
        return WeatherForecastResponse(
            location=loc,
            current=current,
            hourly=hourly_items,
            daily=daily_items,
            source="Open-Meteo Forecast API (ECMWF/GFS)",
            timestamp=now_iso
        )

    @staticmethod
    async def get_marine_weather(lat: float, lon: float) -> Dict[str, Any]:
        """Fetch marine conditions (wave height, wave direction, swell) from Open-Meteo Marine API."""
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": ["wave_height", "wave_direction", "wave_period", "wind_wave_height"],
            "daily": ["wave_height_max", "wave_direction_dominant"],
            "timezone": "Asia/Kolkata"
        }
        async with httpx.AsyncClient(timeout=8.0) as client:
            try:
                response = await client.get(settings.OPEN_METEO_MARINE_URL, params=params)
                if response.status_code == 200:
                    return response.json()
            except Exception as e:
                print(f"Error fetching marine data: {e}")
        return {}

