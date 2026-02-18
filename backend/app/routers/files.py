import os
from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.submission_file import SubmissionFile
from app.config import settings
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/files", tags=["files"])


@router.post("/upload", response_model=dict)
async def upload_file(
    submission_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    from app.storage.local import LocalFilesystemBackend
    backend = LocalFilesystemBackend()
    content = await file.read()
    stored_path = await backend.save(content, file.filename or "upload", folder="submissions")

    record = SubmissionFile(
        submission_id=submission_id,
        file_url=stored_path,
        file_type=file.content_type,
        original_filename=file.filename,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"file_id": record.id, "stored_path": stored_path}


@router.get("/{file_path:path}")
def serve_file(file_path: str, _: User = Depends(get_current_user)):
    full_path = os.path.join(settings.LOCAL_UPLOAD_DIR, file_path)
    if not os.path.exists(full_path):
        raise NotFoundError("File not found")
    return FileResponse(full_path)
