import os
import uuid
from pathlib import Path
from app.storage.base import StorageBackend
from app.config import settings


class LocalFilesystemBackend(StorageBackend):
    def __init__(self):
        self.base_dir = Path(settings.LOCAL_UPLOAD_DIR)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    async def save(self, file_bytes: bytes, filename: str, folder: str = "uploads") -> str:
        folder_path = self.base_dir / folder
        folder_path.mkdir(parents=True, exist_ok=True)
        unique_name = f"{uuid.uuid4()}_{filename}"
        file_path = folder_path / unique_name
        file_path.write_bytes(file_bytes)
        return f"{folder}/{unique_name}"

    async def get_url(self, stored_path: str) -> str:
        return f"/files/{stored_path}"

    async def delete(self, stored_path: str) -> None:
        file_path = self.base_dir / stored_path
        if file_path.exists():
            file_path.unlink()
