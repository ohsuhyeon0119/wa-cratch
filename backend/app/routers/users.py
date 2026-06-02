from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas import UserResponse
from app.core.security import get_current_user
from app.database import get_db
from app.services import auth_service

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def me(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    username: str = current_user.get("sub", "")
    user = auth_service.get_user_by_username(db, username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    stats = auth_service.get_user_stats(db, user.id)
    return UserResponse(
        id=user.id,
        username=user.username,
        nickname=user.nickname,
        avatar=user.avatar,
        projectCount=stats["projectCount"],
        totalLikes=stats["totalLikes"],
    )
