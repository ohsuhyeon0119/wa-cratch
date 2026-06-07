import os

import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user

router = APIRouter()


@router.post("/token")
async def get_voice_token(current_user: dict = Depends(get_current_user)) -> dict:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OPENAI_API_KEY not configured",
        )
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/realtime/client_secrets",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "session": {
                    "type": "realtime",
                    "model": "gpt-realtime-2",
                    "audio": {"output": {"voice": "shimmer"}},
                }
            },
        )
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"OpenAI API error: {response.text}",
        )
    return {"client_secret": response.json()["value"]}
