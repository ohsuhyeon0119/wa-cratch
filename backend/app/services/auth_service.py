from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User
from app.models.project import Project
from app.core.security import hash_password, verify_password


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def create_user(db: Session, username: str, nickname: str, password: str, avatar: str = "🐱") -> User:
    user = User(
        username=username,
        nickname=nickname,
        avatar=avatar,
        password_hash=hash_password(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, username: str, password: str) -> User | None:
    user = get_user_by_username(db, username)
    if user is None or not verify_password(password, user.password_hash):
        return None
    return user


def get_user_stats(db: Session, user_id: str) -> dict:
    project_count = db.query(func.count(Project.id)).filter(Project.user_id == user_id).scalar() or 0
    total_likes = db.query(func.sum(Project.likes)).filter(Project.user_id == user_id).scalar() or 0
    return {
        "projectCount": project_count,
        "totalLikes": total_likes,
    }
