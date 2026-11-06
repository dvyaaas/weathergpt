import json
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
from app.schemas.chat import ChatRequest
from app.services.ai_agent import WeatherAIAgent

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("")
async def chat_sse(request: ChatRequest):
    """Server-Sent Events (SSE) streaming endpoint for AI Weather Chat."""
    async def event_generator():
        try:
            async for token in WeatherAIAgent.generate_response_stream(
                message=request.message,
                persona=request.persona,
                language=request.language,
                lat=request.latitude,
                lon=request.longitude,
                location_name=request.location_name
            ):
                yield {
                    "event": "message",
                    "data": json.dumps({"token": token})
                }
            yield {
                "event": "done",
                "data": json.dumps({"status": "completed"})
            }
        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)})
            }

    return EventSourceResponse(event_generator())

