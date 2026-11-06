from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class PersonaMode(str, Enum):
    GENERAL = "general"
    FARMER = "farmer"
    AVIATION = "aviation"
    MARINE = "marine"

class SupportedLanguage(str, Enum):
    EN = "en"
    HI = "hi"
    TA = "ta"
    TE = "te"
    BN = "bn"

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user', 'assistant', or 'system'")
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., description="User's query")
    persona: PersonaMode = PersonaMode.GENERAL
    language: SupportedLanguage = SupportedLanguage.EN
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    conversation_history: Optional[List[ChatMessage]] = []

class Citation(BaseModel):
    source: str
    timestamp: str
    location: str
    temperature: Optional[float] = None
    weather_condition: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    persona: PersonaMode
    language: SupportedLanguage
    citation: Citation

