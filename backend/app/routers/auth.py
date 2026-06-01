from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
    get_current_user,
)

router = APIRouter()

# ---------------------------------------------------------------------------
# In-memory mock user store
# ---------------------------------------------------------------------------

MOCK_USERS: dict[str, dict] = {
    "test": {
        "id": "user-test-001",
        "username": "test",
        "nickname": "테스트유저",
        "avatar": "🧇",
        "password_hash": hash_password("test"),
        "projectCount": 6,
        "followers": 42,
        "totalLikes": 424,
    }
}


# ---------------------------------------------------------------------------
# POST /auth/register
# ---------------------------------------------------------------------------

@router.post("/register", response_model=TokenResponse)
async def register(body: RegisterRequest) -> TokenResponse:
    """Register a new user and return a JWT token."""
    if body.username in MOCK_USERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )

    MOCK_USERS[body.username] = {
        "id": f"user-{body.username}-001",
        "username": body.username,
        "nickname": body.nickname,
        "avatar": "🐱",
        "password_hash": hash_password(body.password),
        "projectCount": 0,
        "followers": 0,
        "totalLikes": 0,
    }

    access_token = create_access_token(data={"sub": body.username})
    return TokenResponse(access_token=access_token)


# ---------------------------------------------------------------------------
# POST /auth/login
# ---------------------------------------------------------------------------

@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest) -> TokenResponse:
    """Authenticate a user and return a JWT token."""
    user = MOCK_USERS.get(body.username)
    if user is None or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": body.username})
    return TokenResponse(access_token=access_token)


# ---------------------------------------------------------------------------
# GET /auth/me
# ---------------------------------------------------------------------------

@router.get("/me", response_model=UserResponse)
async def me(current_user: dict = Depends(get_current_user)) -> UserResponse:
    """Return the profile of the currently authenticated user."""
    username: str = current_user.get("sub", "")
    user = MOCK_USERS.get(username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserResponse(
        id=user["id"],
        username=user["username"],
        nickname=user["nickname"],
        avatar=user["avatar"],
        projectCount=user["projectCount"],
        followers=user["followers"],
        totalLikes=user["totalLikes"],
    )
