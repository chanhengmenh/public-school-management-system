from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.core.exceptions import UnauthorizedError


def login(db: Session, email: str, password: str) -> dict:
    user = db.query(User).filter(User.email == email, User.is_active == True).first()
    if not user or not verify_password(password, user.hashed_password):
        raise UnauthorizedError("Invalid email or password")

    token_claims = {
        "sub": str(user.id),
        "role": user.role.value,
        "is_home_teacher": user.is_home_teacher,
        "is_class_monitor": user.is_class_monitor,
    }
    return {
        "access_token": create_access_token(token_claims),
        "refresh_token": create_refresh_token(token_claims),
    }


def refresh_access_token(db: Session, refresh_token: str) -> str:
    payload = decode_token(refresh_token)
    user_id = payload.get("sub")
    token_type = payload.get("type")

    if not user_id or token_type != "refresh":
        raise UnauthorizedError("Invalid refresh token")

    user = db.query(User).filter(User.id == int(user_id), User.is_active == True).first()
    if not user:
        raise UnauthorizedError("User not found")

    return create_access_token({
        "sub": str(user.id),
        "role": user.role.value,
        "is_home_teacher": user.is_home_teacher,
        "is_class_monitor": user.is_class_monitor,
    })
