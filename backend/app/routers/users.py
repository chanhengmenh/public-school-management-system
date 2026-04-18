from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserRead, UserUpdate, ProfileUpdate
from app.services import user_service
from app.core.permissions import require_roles

router = APIRouter(prefix="/users", tags=["users"])

admin_only = Depends(require_roles(UserRole.admin))


@router.get("/", response_model=list[UserRead], dependencies=[admin_only])
def list_users(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return user_service.get_users(db, skip, limit)


@router.post("/", response_model=UserRead, dependencies=[admin_only])
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    return user_service.create_user(db, data)


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserRead)
def update_me(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Users can update their own name, email, or password.
    Changing password also clears the must_change_password flag."""
    user = user_service.update_user(db, current_user.id, data)
    if data.password and user.must_change_password:
        user.must_change_password = False
        db.commit()
        db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserRead, dependencies=[admin_only])
def get_user(user_id: int, db: Session = Depends(get_db)):
    return user_service.get_user(db, user_id)


@router.put("/{user_id}", response_model=UserRead, dependencies=[admin_only])
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    return user_service.update_user(db, user_id, data)


@router.delete("/{user_id}", dependencies=[admin_only])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user_service.delete_user(db, user_id)
    return {"message": "User deleted"}
