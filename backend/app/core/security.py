"""
JWT token management and password hashing utilities for authentication.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

# Configuration
SECRET_KEY = "dev-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for extracting token from Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# OAuth2 scheme that does NOT raise an error when no token is provided
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.

    Args:
        data: Dictionary containing token claims (e.g., {"sub": "username"})
        expires_delta: Custom expiration time delta. If None, uses ACCESS_TOKEN_EXPIRE_HOURS.

    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()

    # Set expiration time
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)

    to_encode.update({"exp": expire})

    # Encode with HS256
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT access token.

    Args:
        token: JWT token string to decode

    Returns:
        Decoded token payload as dictionary

    Raises:
        HTTPException: 401 Unauthorized if token is invalid or expired
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def hash_password(plain: str) -> str:
    """
    Hash a plain text password using bcrypt.

    Args:
        plain: Plain text password to hash

    Returns:
        Hashed password string
    """
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """
    Verify a plain text password against a bcrypt hash.

    Args:
        plain: Plain text password to verify
        hashed: Hashed password to compare against

    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain, hashed)


async def get_optional_current_user(token: Optional[str] = Depends(oauth2_scheme_optional)) -> Optional[dict]:
    """
    Optional authentication dependency. Returns None if no token is provided or
    if the token is invalid/expired, instead of raising an exception.

    Args:
        token: Optional JWT token from Authorization header

    Returns:
        Decoded token payload if valid token provided, None otherwise
    """
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Dependency for extracting and validating the current user from token.

    Args:
        token: JWT token from Authorization header (injected via OAuth2PasswordBearer)

    Returns:
        Decoded token payload containing user information

    Raises:
        HTTPException: 401 Unauthorized if token is invalid or expired
    """
    payload = decode_access_token(token)
    return payload
