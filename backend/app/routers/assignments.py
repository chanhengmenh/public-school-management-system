from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import UserRole, User
from app.models.assignment import Assignment, AssignmentStatus
from app.schemas.assignment import AssignmentCreate, AssignmentRead, AssignmentUpdate
from app.core.permissions import require_roles
from app.core.exceptions import NotFoundError, ForbiddenError

router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.get("/", response_model=list[AssignmentRead])
def list_assignments(class_subject_id: int | None = None, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    q = db.query(Assignment)
    if class_subject_id:
        q = q.filter(Assignment.class_subject_id == class_subject_id)
    if current_user.role in (UserRole.student, UserRole.class_monitor):
        q = q.filter(Assignment.status == AssignmentStatus.published)
    return q.all()


@router.post("/", response_model=AssignmentRead,
             dependencies=[Depends(require_roles(UserRole.teacher, UserRole.home_teacher, UserRole.admin))])
def create_assignment(data: AssignmentCreate, db: Session = Depends(get_db),
                       current_user: User = Depends(get_current_user)):
    obj = Assignment(**data.model_dump(), publisher_id=current_user.id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{assignment_id}", response_model=AssignmentRead)
def get_assignment(assignment_id: int, db: Session = Depends(get_db),
                    _: User = Depends(get_current_user)):
    obj = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not obj:
        raise NotFoundError(f"Assignment {assignment_id} not found")
    return obj


@router.put("/{assignment_id}", response_model=AssignmentRead,
            dependencies=[Depends(require_roles(UserRole.teacher, UserRole.home_teacher, UserRole.admin))])
def update_assignment(assignment_id: int, data: AssignmentUpdate, db: Session = Depends(get_db)):
    obj = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not obj:
        raise NotFoundError()
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


@router.post("/{assignment_id}/publish", response_model=AssignmentRead,
             dependencies=[Depends(require_roles(UserRole.teacher, UserRole.home_teacher, UserRole.admin))])
def publish_assignment(assignment_id: int, db: Session = Depends(get_db)):
    obj = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not obj:
        raise NotFoundError()
    obj.status = AssignmentStatus.published
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{assignment_id}",
               dependencies=[Depends(require_roles(UserRole.teacher, UserRole.home_teacher, UserRole.admin))])
def delete_assignment(assignment_id: int, db: Session = Depends(get_db)):
    obj = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not obj:
        raise NotFoundError()
    db.delete(obj)
    db.commit()
    return {"message": "Assignment deleted"}
