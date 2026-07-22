from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.core.exceptions import CredentialsException
from app.models.user import User
from app.schemas.user import Token, LoginRequest, RefreshTokenRequest

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate user with JSON payload and return JWT access & refresh tokens.
    """
    result = await db.execute(select(User).where(User.username == login_data.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise CredentialsException(detail="Incorrect username or password")

    access_token = create_access_token(subject=user.username, role=user.role)
    refresh_token = create_refresh_token(subject=user.username, role=user.role)

    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/login/form", response_model=Token)
async def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """
    OAuth2 compatible form login for Swagger UI documentation interactive testing.
    """
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise CredentialsException(detail="Incorrect username or password")

    access_token = create_access_token(subject=user.username, role=user.role)
    refresh_token = create_refresh_token(subject=user.username, role=user.role)

    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_req: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Generates new JWT Access Token using a valid Refresh Token.
    """
    payload = decode_token(refresh_req.refresh_token)
    if payload.get("type") != "refresh":
        raise CredentialsException(detail="Invalid refresh token type")

    username = payload.get("sub")
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()

    if not user:
        raise CredentialsException(detail="User not found")

    new_access_token = create_access_token(subject=user.username, role=user.role)
    new_refresh_token = create_refresh_token(subject=user.username, role=user.role)

    return Token(access_token=new_access_token, refresh_token=new_refresh_token)


@router.post("/logout")
async def logout():
    """
    Logout endpoint (Stateless JWT token invalidation signal).
    """
    return {"message": "Successfully logged out"}
