from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class GeoLocation(BaseModel):
    id: Optional[int] = None
    name: str
    latitude: float
    longitude: float
    elevation: Optional[float] = None
    country_code: Optional[str] = None
    admin1: Optional[str] = None  # State / Province (e.g. Tamil Nadu, Maharashtra)
    country: Optional[str] = None
    timezone: Optional[str] = None

class CurrentWeather(BaseModel):
    temperature: float = Field(..., description="Temperature in Celsius")
    apparent_temperature: float = Field(..., description="Feels-like temperature in Celsius")
    relative_humidity: int = Field(..., description="Relative humidity in percentage")
    is_day: int = Field(..., description="1 for day, 0 for night")
    precipitation: float = Field(..., description="Precipitation in mm")
    rain: float = Field(..., description="Rain in mm")
    weather_code: int = Field(..., description="WMO weather code")
    weather_description: str = Field(..., description="Human readable weather condition")
    surface_pressure: float = Field(..., description="Pressure in hPa")
    wind_speed: float = Field(..., description="Wind speed in km/h")
    wind_direction: int = Field(..., description="Wind direction in degrees")
    time: str = Field(..., description="ISO observation timestamp")
    source: str = "Open-Meteo Forecast API (ECMWF/GFS)"
    fetched_at: str

class HourlyForecastItem(BaseModel):
    time: str
    temperature: float
    relative_humidity: int
    precipitation_probability: int
    precipitation: float
    weather_code: int
    weather_description: str
    wind_speed: float

class DailyForecastItem(BaseModel):
    date: str
    weather_code: int
    weather_description: str
    temperature_max: float
    temperature_min: float
    precipitation_sum: float
    precipitation_probability_max: int
    wind_speed_max: float

class WeatherForecastResponse(BaseModel):
    location: GeoLocation
    current: CurrentWeather
    hourly: List[HourlyForecastItem]
    daily: List[DailyForecastItem]
    source: str = "Open-Meteo Forecast API (ECMWF/GFS)"
    timestamp: str

