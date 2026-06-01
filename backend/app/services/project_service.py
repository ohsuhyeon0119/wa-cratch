from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.project import Project
from app.models.user import User


def _to_dict(project: Project, author_username: str) -> dict:
    return {
        "id": project.id,
        "title": project.title,
        "author": author_username,
        "authorId": project.user_id,
        "emoji": project.emoji,
        "likes": project.likes,
        "views": project.views,
        "published": project.published,
        "description": project.description,
        "tags": project.tags or [],
        "blocks_json": project.blocks_json or {},
    }


def list_public_projects(db: Session, sort: str = "latest", search: str = "") -> list[dict]:
    query = db.query(Project, User.username).join(User, Project.user_id == User.id).filter(Project.published == True)

    if search:
        search_lower = f"%{search.lower()}%"
        query = query.filter(
            or_(
                Project.title.ilike(search_lower),
                User.username.ilike(search_lower),
                User.nickname.ilike(search_lower),
            )
        )

    if sort == "views":
        query = query.order_by(Project.views.desc())
    elif sort == "likes":
        query = query.order_by(Project.likes.desc())
    else:
        query = query.order_by(Project.created_at.desc())

    return [_to_dict(p, username) for p, username in query.all()]


def list_user_projects(db: Session, user_id: str) -> list[dict]:
    rows = db.query(Project, User.username).join(User, Project.user_id == User.id).filter(Project.user_id == user_id).all()
    return [_to_dict(p, username) for p, username in rows]


def get_project(db: Session, project_id: str) -> dict | None:
    row = db.query(Project, User.username).join(User, Project.user_id == User.id).filter(Project.id == project_id).first()
    if row is None:
        return None
    project, username = row
    return _to_dict(project, username)


def create_project(db: Session, user_id: str, author_username: str, title: str, emoji: str = "🐱", description: str = "", tags: list | None = None) -> dict:
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
    return _to_dict(project, author_username)


def update_project(db: Session, project_id: str, data: dict) -> dict | None:
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        return None
    for key, value in data.items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    user = db.query(User).filter(User.id == project.user_id).first()
    return _to_dict(project, user.username if user else "")


def delete_project(db: Session, project_id: str) -> None:
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        db.delete(project)
        db.commit()
