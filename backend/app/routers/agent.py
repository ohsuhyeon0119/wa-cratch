from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from app.core.security import get_current_user
from app.services.agent_service import ToolContext, stream_agent_response

router = APIRouter()


class HistoryMessage(BaseModel):
    role: str
    content: str


class ProjectContext(BaseModel):
    title: str
    blocks_json: dict[str, Any] = {}


class AgentChatRequest(BaseModel):
    message: str
    history: list[HistoryMessage] = []
    project_context: ProjectContext
    nickname: str


@router.post("/chat")
async def agent_chat(
    body: AgentChatRequest,
    _current_user: dict = Depends(get_current_user),
):
    ctx = ToolContext(
        project_context=body.project_context.model_dump(),
        nickname=body.nickname,
    )
    history = [{"role": m.role, "content": m.content} for m in body.history]

    async def event_generator():
        async for chunk in stream_agent_response(body.message, history, ctx):
            yield {"data": chunk}
        yield {"data": "[DONE]"}

    return EventSourceResponse(event_generator())
