from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import UserRole, User
from app.models.grade_category import GradeCategory
from app.schemas.grade_category import GradeCategoryCreate, GradeCategoryRead, GradeCategoryUpdate
from app.core.permissions import require_roles
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/grade-categories", tags=["grade-categories"])


def _validate_total_weight(db: Session, class_subject_id: int, new_weight: float,
                            exclude_id: int | None = None) -> None:
    """Raise 400 if adding new_weight would push total above 1.0."""
    q = db.query(GradeCategory).filter(GradeCategory.class_subject_id == class_subject_id)
    if exclude_id is not None:
        q = q.filter(GradeCategory.id != exclude_id)
    existing_total = sum(float(c.weight) for c in q.all())
    if existing_total + new_weight > 1.0001:
        raise HTTPException(status_code=400, detail="Total weights exceed 100%")


@router.get("/", response_model=list[GradeCategoryRead])
def list_categories(class_subject_id: int, db: Session = Depends(get_db),
                    _: User = Depends(get_current_user)):
    return db.query(GradeCategory).filter(
        GradeCategory.class_subject_id == class_subject_id
    ).all()


@router.post("/", response_model=GradeCategoryRead,
             dependencies=[Depends(require_roles(UserRole.teacher, UserRole.admin))])
def create_category(data: GradeCategoryCreate, db: Session = Depends(get_db)):
    _validate_total_weight(db, data.class_subject_id, data.weight)
    obj = GradeCategory(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{category_id}", response_model=GradeCategoryRead,
            dependencies=[Depends(require_roles(UserRole.teacher, UserRole.admin))])
def update_category(category_id: int, data: GradeCategoryUpdate, db: Session = Depends(get_db)):
    obj = db.query(GradeCategory).filter(GradeCategory.id == category_id).first()
    if not obj:
        raise NotFoundError(f"GradeCategory {category_id} not found")
    if data.weight is not None:
        _validate_total_weight(db, obj.class_subject_id, data.weight, exclude_id=category_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{category_id}",
               dependencies=[Depends(require_roles(UserRole.teacher, UserRole.admin))])
def delete_category(category_id: int, db: Session = Depends(get_db)):
    obj = db.query(GradeCategory).filter(GradeCategory.id == category_id).first()
    if not obj:
        raise NotFoundError(f"GradeCategory {category_id} not found")
    db.delete(obj)
    db.commit()
    return {"message": "Category deleted"}
