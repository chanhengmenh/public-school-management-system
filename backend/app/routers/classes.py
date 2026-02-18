from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import UserRole, User
from app.schemas.class_ import ClassCreate, ClassRead, ClassUpdate
from app.schemas.user import UserRead
from app.core.permissions import require_roles
from app.core.exceptions import NotFoundError
from app.models.class_ import Class
from app.models.enrollment import Enrollment

router = APIRouter(prefix="/classes", tags=["classes"])


@router.get("/", response_model=list[ClassRead])
def list_classes(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Class).all()


@router.post("/", response_model=ClassRead,
             dependencies=[Depends(require_roles(UserRole.admin))])
def create_class(data: ClassCreate, db: Session = Depends(get_db)):
    obj = Class(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{class_id}", response_model=ClassRead)
def get_class(class_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    obj = db.query(Class).filter(Class.id == class_id).first()
    if not obj:
        raise NotFoundError(f"Class {class_id} not found")
    return obj


@router.put("/{class_id}", response_model=ClassRead,
            dependencies=[Depends(require_roles(UserRole.admin))])
def update_class(class_id: int, data: ClassUpdate, db: Session = Depends(get_db)):
    obj = db.query(Class).filter(Class.id == class_id).first()
    if not obj:
        raise NotFoundError(f"Class {class_id} not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{class_id}", dependencies=[Depends(require_roles(UserRole.admin))])
def delete_class(class_id: int, db: Session = Depends(get_db)):
    obj = db.query(Class).filter(Class.id == class_id).first()
    if not obj:
        raise NotFoundError(f"Class {class_id} not found")
    db.delete(obj)
    db.commit()
    return {"message": "Class deleted"}


@router.get("/{class_id}/students", response_model=list[UserRead])
def get_class_students(class_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    enrollments = db.query(Enrollment).filter(Enrollment.class_id == class_id).all()
    return [e.student for e in enrollments]
