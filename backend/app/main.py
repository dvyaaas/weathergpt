from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import weather, geo, chat

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multilingual Voice-Enabled AI Weather Assistant for India (SIH26068)"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all dev origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(weather.router, prefix=settings.API_V1_STR)
app.include_router(geo.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "WeatherGPT API",
        "version": settings.VERSION,
        "engine": "FastAPI + Open-Meteo"
    }

@app.get(f"{settings.API_V1_STR}/alerts")
async def get_alerts(lat: float = 28.6139, lon: float = 77.2090):
    """Initial alerts feed - provides active IMD / regional advisory bulletins."""
    return {
        "active_alerts": [
            {
                "id": "IMD-ADV-2026-001",
                "severity": "Warning",
                "headline": "Moderate to heavy rainfall alert for coastal districts",
                "event": "Heavy Rain & Squally Wind",
                "effective": "2026-11-06T12:00:00Z",
                "expires": "2026-11-08T23:59:00Z",
                "sender_name": "India Meteorological Department (IMD)",
                "area_description": "Coastal Tamil Nadu, Andhra Pradesh & Puducherry",
                "instruction": "Fishermen are advised not to venture into southwest Bay of Bengal during next 48 hours."
            }
        ]
    }

@app.get(f"{settings.API_V1_STR}/outbox")
async def get_outbox():
    """Simulated SMS and WhatsApp dispatch outbox for demonstration."""
    return {
        "messages": [
            {
                "id": "MSG-9821",
                "type": "SMS",
                "recipient": "+91 98765 43210 (Kisan Alert)",
                "content": "IMD ALERT: Heavy rain expected in Madurai region. Postpone foliar spraying of crops. - WeatherGPT",
                "timestamp": "2026-11-06T14:30:00Z",
                "status": "Delivered"
            },
            {
                "id": "MSG-9822",
                "type": "WhatsApp",
                "recipient": "+91 94441 23456 (Marine Group)",
                "content": "🌊 INCOIS/IMD ADVISORY: Wave height 2.8m, wind gusts 48 km/h. Sea condition ROUGH. Status: NO-GO.",
                "timestamp": "2026-11-06T14:35:00Z",
                "status": "Delivered"
            }
        ]
    }

