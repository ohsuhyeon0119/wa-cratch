from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.project import Project
from app.models.user import User


def _to_dict(project: Project, author_nickname: str) -> dict:
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


def list_public_projects(db: Session, sort: str = "latest", search: str = "") -> list[dict]:
    query = db.query(Project, User.nickname).join(User, Project.user_id == User.id)

    if search:
        search_lower = f"%{search.lower()}%"
        query = query.filter(
            or_(
                Project.title.ilike(search_lower),
                User.username.ilike(search_lower),
                User.nickname.ilike(search_lower),
            )
        )

    if sort == "likes":
        query = query.order_by(Project.likes.desc())
    else:
        query = query.order_by(Project.created_at.desc())

    return [_to_dict(p, nickname) for p, nickname in query.all()]


def list_user_projects(db: Session, user_id: str) -> list[dict]:
    rows = db.query(Project, User.nickname).join(User, Project.user_id == User.id).filter(Project.user_id == user_id).all()
    return [_to_dict(p, nickname) for p, nickname in rows]


def get_project(db: Session, project_id: str) -> dict | None:
    row = db.query(Project, User.nickname).join(User, Project.user_id == User.id).filter(Project.id == project_id).first()
    if row is None:
        return None
    project, nickname = row
    return _to_dict(project, nickname)


def create_project(db: Session, user_id: str, author_nickname: str, title: str, emoji: str = "🐱", description: str = "", tags: list | None = None) -> dict:
    project = Project(
        user_id=user_id,
        title=title,
        emoji=emoji,
        description=description,
        tags=tags or [],
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return _to_dict(project, author_nickname)


def update_project(db: Session, project_id: str, data: dict) -> dict | None:
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        return None
    for key, value in data.items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    user = db.query(User).filter(User.id == project.user_id).first()
    return _to_dict(project, user.nickname if user else "")


def delete_project(db: Session, project_id: str) -> None:
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        db.delete(project)
        db.commit()
