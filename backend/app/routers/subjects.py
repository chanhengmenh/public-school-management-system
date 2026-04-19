from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import UserRole, User
from app.schemas.subject import SubjectCreate, SubjectRead, SubjectUpdate
from app.core.permissions import require_roles
from app.core.exceptions import NotFoundError
from app.models.subject import Subject

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.get("/", response_model=list[SubjectRead])
def list_subjects(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Subject).all()


@router.post("/", response_model=SubjectRead,
             dependencies=[Depends(require_roles(UserRole.admin))])
def create_subject(data: SubjectCreate, db: Session = Depends(get_db)):
    payload = data.model_dump()
    if not payload.get("code"):
        # Auto-generate a slug from the name (e.g. "Earth Science" → "EARTH_SCIENCE")
        payload["code"] = data.name.upper().replace(" ", "_").replace("&", "AND")[:20]
    obj = Subject(**payload)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{subject_id}", response_model=SubjectRead)
def get_subject(subject_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    obj = db.query(Subject).filter(Subject.id == subject_id).first()
    if not obj:
        raise NotFoundError(f"Subject {subject_id} not found")
    return obj


@router.put("/{subject_id}", response_model=SubjectRead,
            dependencies=[Depends(require_roles(UserRole.admin))])
def update_subject(subject_id: int, data: SubjectUpdate, db: Session = Depends(get_db)):
    obj = db.query(Subject).filter(Subject.id == subject_id).first()
    if not obj:
        raise NotFoundError(f"Subject {subject_id} not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{subject_id}", dependencies=[Depends(require_roles(UserRole.admin))])
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    obj = db.query(Subject).filter(Subject.id == subject_id).first()
    if not obj:
        raise NotFoundError(f"Subject {subject_id} not found")
    db.delete(obj)
    db.commit()
    return {"message": "Subject deleted"}
