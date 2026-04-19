from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.dependencies import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.material import Material
from app.models.class_subject import ClassSubject
from app.models.enrollment import Enrollment
from app.schemas.material import MaterialCreate, MaterialRead, MaterialUpdate
from app.core.permissions import require_roles
from app.core.exceptions import NotFoundError, ForbiddenError

router = APIRouter(prefix="/materials", tags=["materials"])


def _load_options():
    return [joinedload(Material.uploader)]


def _get_material_or_404(db: Session, material_id: int) -> Material:
    obj = db.query(Material).options(*_load_options()).filter(Material.id == material_id).first()
    if not obj:
        raise NotFoundError(f"Material {material_id} not found")
    return obj


@router.post("/", response_model=MaterialRead,
             dependencies=[Depends(require_roles(UserRole.teacher, UserRole.admin))])
def create_material(data: MaterialCreate, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    obj = Material(
        class_subject_id=data.class_subject_id,
        uploader_id=current_user.id,
        title=data.title,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return db.query(Material).options(*_load_options()).filter(Material.id == obj.id).first()


@router.put("/{material_id}", response_model=MaterialRead,
            dependencies=[Depends(require_roles(UserRole.teacher, UserRole.admin))])
def update_material(material_id: int, data: MaterialUpdate, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    obj = _get_material_or_404(db, material_id)
    if current_user.role == UserRole.teacher and obj.uploader_id != current_user.id:
        raise ForbiddenError("You can only update your own materials")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return db.query(Material).options(*_load_options()).filter(Material.id == obj.id).first()


@router.get("/class-subjects/{class_subject_id}", response_model=list[MaterialRead])
def list_materials(class_subject_id: int, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    # Students must be enrolled in the class; teachers/admins pass through
    if current_user.role == UserRole.student:
        cs = db.query(ClassSubject).filter(ClassSubject.id == class_subject_id).first()
        if not cs:
            raise NotFoundError("Class subject not found")
        enrolled = db.query(Enrollment).filter(
            Enrollment.class_id == cs.class_id,
            Enrollment.student_id == current_user.id,
        ).first()
        if not enrolled:
            raise ForbiddenError("Not enrolled in this class")

    return (
        db.query(Material)
        .options(*_load_options())
        .filter(Material.class_subject_id == class_subject_id)
        .order_by(Material.created_at.desc())
        .all()
    )


@router.delete("/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    obj = _get_material_or_404(db, material_id)
    if current_user.role == UserRole.teacher and obj.uploader_id != current_user.id:
        raise ForbiddenError("You can only delete your own materials")
    if current_user.role == UserRole.student:
        raise ForbiddenError("Students cannot delete materials")
    db.delete(obj)
    db.commit()
    return {"message": "Material deleted"}
