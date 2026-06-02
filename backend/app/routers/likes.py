from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas import ProjectResponse, LikeResponse
from app.core.security import get_current_user
from app.database import get_db
from app.services import auth_service
from app.models.like import Like
from app.models.project import Project
from app.models.user import User

router = APIRouter()


def _project_to_dict(project: Project, author_nickname: str) -> dict:
    return {
        "id": project.id,
        "title": project.title,
        "author": author_nickname,
        "authorId": project.user_id,
        "emoji": project.emoji,
        "likes": project.likes,
        "published": project.published,
        "description": project.description,
        "tags": project.tags or [],
        "blocks_json": project.blocks_json or {},
    }


@router.post("/{project_id}/like", response_model=LikeResponse)
async def toggle_like(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LikeResponse:
    username: str = current_user.get("sub", "")
    user = auth_service.get_user_by_username(db, username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    existing_like = db.query(Like).filter(Like.user_id == user.id, Like.project_id == project_id).first()

    if existing_like:
        db.delete(existing_like)
        project.likes = max(0, project.likes - 1)
        db.commit()
        db.refresh(project)
        return LikeResponse(liked=False, likes=project.likes)
    else:
        new_like = Like(user_id=user.id, project_id=project_id)
        db.add(new_like)
        project.likes = project.likes + 1
        db.commit()
        db.refresh(project)
        return LikeResponse(liked=True, likes=project.likes)


@router.get("/liked", response_model=list[ProjectResponse])
async def list_liked_projects(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ProjectResponse]:
    username: str = current_user.get("sub", "")
    user = auth_service.get_user_by_username(db, username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    rows = (
        db.query(Project, User.nickname)
        .join(Like, Like.project_id == Project.id)
        .join(User, User.id == Project.user_id)
        .filter(Like.user_id == user.id)
        .all()
    )

    return [ProjectResponse(**_project_to_dict(project, nickname)) for project, nickname in rows]
