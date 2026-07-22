from typing import Callable, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import CredentialsException, PermissionDeniedException
from app.models.user import User
from app.schemas.user import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Validates JWT Bearer token and returns authenticated User model instance.
    """
    payload_dict = decode_token(token)
    token_data = TokenPayload(**payload_dict)

    if token_data.type != "access" or not token_data.sub:
        raise CredentialsException(detail="Invalid token type or subject")

    result = await db.execute(select(User).where(User.username == token_data.sub))
    user = result.scalar_one_or_none()

    if user is None:
        raise CredentialsException(detail="User not found")

    return user


def require_role(allowed_roles: List[str]) -> Callable:
    """
    Dependency factory checking if the authenticated user has one of the allowed roles.
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise PermissionDeniedException(
                detail=f"Role '{current_user.role}' is not authorized. Required: {allowed_roles}"
            )
        return current_user

    return role_checker
