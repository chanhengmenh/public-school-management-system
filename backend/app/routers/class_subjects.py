from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.dependencies import get_db, get_current_user
from app.models.user import UserRole, User
from app.schemas.class_subject import ClassSubjectCreate, ClassSubjectRead, ClassSubjectUpdate
from app.core.permissions import require_roles, require_home_teacher
from app.core.exceptions import NotFoundError
from app.models.class_subject import ClassSubject

router = APIRouter(prefix="/class-subjects", tags=["class-subjects"])


@router.get("/{cs_id}", response_model=ClassSubjectRead)
def get_class_subject(cs_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    obj = db.query(ClassSubject).options(
        joinedload(ClassSubject.subject),
        joinedload(ClassSubject.class_),
        joinedload(ClassSubject.teacher),
    ).filter(ClassSubject.id == cs_id).first()
    if not obj:
        raise NotFoundError(f"ClassSubject {cs_id} not found")
    return obj


@router.get("/", response_model=list[ClassSubjectRead])
def list_class_subjects(class_id: int | None = None, teacher_id: int | None = None,
                         db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    q = db.query(ClassSubject).options(
        joinedload(ClassSubject.subject),
        joinedload(ClassSubject.class_),
        joinedload(ClassSubject.teacher),
    )
    if class_id:
        q = q.filter(ClassSubject.class_id == class_id)
    if teacher_id:
        q = q.filter(ClassSubject.teacher_id == teacher_id)
    return q.all()


@router.post("/", response_model=ClassSubjectRead,
             dependencies=[Depends(require_home_teacher())])
def create_class_subject(data: ClassSubjectCreate, db: Session = Depends(get_db)):
    obj = ClassSubject(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{cs_id}", response_model=ClassSubjectRead,
            dependencies=[Depends(require_roles(UserRole.admin))])
def update_class_subject(cs_id: int, data: ClassSubjectUpdate, db: Session = Depends(get_db)):
    obj = db.query(ClassSubject).filter(ClassSubject.id == cs_id).first()
    if not obj:
        raise NotFoundError(f"ClassSubject {cs_id} not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{cs_id}", dependencies=[Depends(require_roles(UserRole.admin))])
def delete_class_subject(cs_id: int, db: Session = Depends(get_db)):
    obj = db.query(ClassSubject).filter(ClassSubject.id == cs_id).first()
    if not obj:
        raise NotFoundError(f"ClassSubject {cs_id} not found")
    db.delete(obj)
    db.commit()
    return {"message": "Deleted"}
