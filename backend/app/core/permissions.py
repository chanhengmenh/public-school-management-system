from typing import Callable
from fastapi import Depends
from app.dependencies import get_current_user
from app.models.user import User, UserRole
from app.core.exceptions import ForbiddenError


def require_roles(*roles: UserRole) -> Callable:
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise ForbiddenError(
                f"Access requires one of these roles: {[r.value for r in roles]}"
            )
        return current_user
    return dependency
