from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.submission_file import SubmissionFile
from app.config import settings
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/files", tags=["files"])

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB

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
    resource_type: str = Query("submissions"),
    resource_id: int = Query(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    if not file.content_type or file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed types: {', '.join(sorted(ALLOWED_TYPES))}")

    try:
        backend = _get_storage_backend()
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Storage backend unavailable") from exc

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 20 MB")

    try:
        stored_path = await backend.save(content, file.filename or "upload", resource_type, resource_id)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="File upload failed") from exc

    if resource_type == "submissions":
        try:
            record = SubmissionFile(
                submission_id=resource_id,
                file_url=stored_path,
                file_type=file.content_type,
                original_filename=file.filename,
            )
            db.add(record)
            db.commit()
            db.refresh(record)
        except Exception as exc:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to save file record") from exc
        return {"file_id": record.id, "stored_path": stored_path}

    return {"stored_path": stored_path}


@router.get("/{file_path:path}/signed-url", response_model=dict)
def get_signed_url(file_path: str, expires: int = Query(3600), _: User = Depends(get_current_user)):
    """Get a signed URL for a stored file (private bucket only for Supabase)."""
    backend = _get_storage_backend()
    signed_url = backend.get_signed_url(file_path, expires)
    return {"url": signed_url}


@router.get("/{file_path:path}")
def serve_file(file_path: str, _: User = Depends(get_current_user)):
    base = Path(settings.LOCAL_UPLOAD_DIR).resolve()
    full_path = (base / file_path).resolve()
    if not str(full_path).startswith(str(base)):
        raise NotFoundError("File not found")
    if not full_path.exists():
        raise NotFoundError("File not found")
    return FileResponse(str(full_path))
