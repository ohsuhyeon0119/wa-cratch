import json
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from sse_starlette.sse import EventSourceResponse

from app.core.security import get_current_user
from app.database import SessionLocal, get_db
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

        # write tool이 pending_action을 설정했으면 ACTION 이벤트 전송 (히스토리 저장 전)
        if ctx.pending_action:
            yield {"data": f"ACTION:{json.dumps(ctx.pending_action, ensure_ascii=False)}"}

        # Depends(get_db) 세션은 이 generator가 실행될 때 이미 닫혀 있으므로
        # 새 세션을 직접 열어서 커밋한다
        new_messages = history + [
            {"role": "user", "content": body.message},
            {"role": "assistant", "content": "".join(accumulated)},
        ]
        commit_db = SessionLocal()
        try:
            commit_record = commit_db.query(ConversationSession).filter_by(username=username).first()
            if commit_record:
                commit_record.messages = new_messages
                commit_record.updated_at = datetime.utcnow()
                flag_modified(commit_record, "messages")
            else:
                commit_db.add(ConversationSession(username=username, messages=new_messages))
            commit_db.commit()
        finally:
            commit_db.close()

        yield {"data": "[DONE]"}

    return EventSourceResponse(event_generator())
