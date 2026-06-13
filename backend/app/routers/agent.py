from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse

from app.core.security import get_current_user
from app.database import get_db
from app.models.conversation import ConversationSession
from app.services.agent_service import ToolContext, stream_agent_response

router = APIRouter()


class ProjectContext(BaseModel):
    title: str
    blocks_json: dict[str, Any] = {}


class AgentChatRequest(BaseModel):
    message: str
    project_context: ProjectContext
    nickname: str


@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    username = current_user["sub"]
    record = db.query(ConversationSession).filter_by(username=username).first()
    return {"messages": record.messages if record else []}


@router.post("/chat")
async def agent_chat(
    body: AgentChatRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    username = current_user["sub"]
    record = db.query(ConversationSession).filter_by(username=username).first()
    history: list[dict] = list(record.messages) if record else []

    ctx = ToolContext(
        project_context=body.project_context.model_dump(),
        nickname=body.nickname,
    )

    accumulated: list[str] = []

    async def event_generator():
        async for chunk in stream_agent_response(body.message, history, ctx):
            accumulated.append(chunk)
            yield {"data": chunk}

        # 스트림 완료 후 DB에 저장
        new_messages = history + [
            {"role": "user", "content": body.message},
            {"role": "assistant", "content": "".join(accumulated)},
        ]
        if record:
            record.messages = new_messages
            record.updated_at = datetime.utcnow()
        else:
            db.add(ConversationSession(username=username, messages=new_messages))
        db.commit()

        yield {"data": "[DONE]"}

    return EventSourceResponse(event_generator())
