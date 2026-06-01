from pydantic import BaseModel, Field
from typing import Optional


# ============================================================================
# Auth Request Schemas
# ============================================================================

class RegisterRequest(BaseModel):
    """User registration request"""
    username: str = Field(..., min_length=1, description="Username for account")
    nickname: str = Field(..., min_length=1, description="Display nickname")
    password: str = Field(..., min_length=1, description="User password")


class LoginRequest(BaseModel):
    """User login request"""
    username: str = Field(..., min_length=1, description="Username")
    password: str = Field(..., min_length=1, description="Password")


# ============================================================================
# Auth Response Schemas
# ============================================================================

class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")


# ============================================================================
# User Response Schema
# ============================================================================

class UserResponse(BaseModel):
    """User profile response"""
    id: str = Field(..., description="User ID")
    username: str = Field(..., description="Username")
    nickname: str = Field(..., description="Display nickname")
    avatar: str = Field(..., description="Avatar URL or emoji")
    projectCount: int = Field(..., description="Number of projects created")
    followers: int = Field(..., description="Number of followers")
    totalLikes: int = Field(..., description="Total likes received")


# ============================================================================
# Project Request/Response Schemas
# ============================================================================

class ProjectCreateRequest(BaseModel):
    """Project creation request"""
    title: str = Field(..., min_length=1, description="Project title")
    emoji: str = Field(default="🐱", description="Project emoji")
    description: str = Field(default="", description="Project description")
    tags: list[str] = Field(default_factory=list, description="Project tags")


class ProjectUpdateRequest(BaseModel):
    """Project update request - all fields optional"""
    title: Optional[str] = Field(default=None, description="Project title")
    emoji: Optional[str] = Field(default=None, description="Project emoji")
    description: Optional[str] = Field(default=None, description="Project description")
    tags: Optional[list[str]] = Field(default=None, description="Project tags")
    published: Optional[bool] = Field(default=None, description="Publication status")
    blocks_json: Optional[dict] = Field(default=None, description="Block configuration JSON")


class ProjectResponse(BaseModel):
    """Project response"""
    id: str = Field(..., description="Project ID")
    title: str = Field(..., description="Project title")
    author: str = Field(..., description="Author username")
    authorId: str = Field(..., description="Author user ID")
    emoji: str = Field(..., description="Project emoji")
    likes: int = Field(..., description="Number of likes")
    views: int = Field(..., description="Number of views")
    published: bool = Field(..., description="Publication status")
    description: str = Field(..., description="Project description")
    tags: list[str] = Field(..., description="Project tags")
    blocks_json: dict = Field(default_factory=dict, description="Block configuration JSON")


# ============================================================================
# Activity Response Schema
# ============================================================================

class ActivityResponse(BaseModel):
    """Activity/feed item response"""
    type: str = Field(..., description="Activity type (e.g., like, comment, follow)")
    icon: str = Field(..., description="Activity icon/emoji")
    text: str = Field(..., description="Activity description text")
    actor: str = Field(..., description="Actor username")
    projectTitle: str = Field(..., description="Related project title")
    time: str = Field(..., description="Activity timestamp (ISO format or relative time)")


__all__ = [
    "RegisterRequest",
    "LoginRequest",
    "TokenResponse",
    "UserResponse",
    "ProjectCreateRequest",
    "ProjectUpdateRequest",
    "ProjectResponse",
    "ActivityResponse",
]
