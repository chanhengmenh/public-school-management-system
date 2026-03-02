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


def require_home_teacher() -> Callable:
    """Allow admin OR a teacher with is_home_teacher=True."""
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role == UserRole.admin:
            return current_user
        if current_user.role == UserRole.teacher and current_user.is_home_teacher:
            return current_user
        raise ForbiddenError("Access requires home-teacher privilege or admin role")
    return dependency


def require_class_monitor() -> Callable:
    """Allow admin OR a student with is_class_monitor=True."""
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role == UserRole.admin:
            return current_user
        if current_user.role == UserRole.student and current_user.is_class_monitor:
            return current_user
        raise ForbiddenError("Access requires class-monitor privilege or admin role")
    return dependency
