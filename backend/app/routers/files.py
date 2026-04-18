from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.submission_file import SubmissionFile
from app.config import settings
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/files", tags=["files"])

ALLOWED_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}


def _get_storage_backend():
    if settings.STORAGE_BACKEND == "supabase":
        from app.storage.supabase import SupabaseStorageBackend
        return SupabaseStorageBackend()
    from app.storage.local import LocalFilesystemBackend
    return LocalFilesystemBackend()


@router.post("/upload", response_model=dict)
async def upload_file(
    submission_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="File type not allowed")

    backend = _get_storage_backend()
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
    base = Path(settings.LOCAL_UPLOAD_DIR).resolve()
    full_path = (base / file_path).resolve()
    if not str(full_path).startswith(str(base)):
        raise NotFoundError("File not found")
    if not full_path.exists():
        raise NotFoundError("File not found")
    return FileResponse(str(full_path))
