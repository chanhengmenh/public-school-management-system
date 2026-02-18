from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models.user import UserRole
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services import user_service
from app.core.permissions import require_roles

router = APIRouter(prefix="/users", tags=["users"])

admin_only = Depends(require_roles(UserRole.admin))


@router.get("/", response_model=list[UserRead], dependencies=[admin_only])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return user_service.get_users(db, skip, limit)


@router.post("/", response_model=UserRead, dependencies=[admin_only])
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    return user_service.create_user(db, data)


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
