from pathlib import Path
from app.storage import StorageBackend
from app.config import settings


class LocalFilesystemBackend(StorageBackend):
    """Local filesystem storage backend."""

    async def save(self, content: bytes, filename: str, resource_type: str, resource_id: int) -> str:
        """Save file to local filesystem and return stored_path."""
        stored_path = self.generate_path(resource_type, resource_id, filename)
        full_path = Path(settings.LOCAL_UPLOAD_DIR) / stored_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_bytes(content)
        return stored_path

    def get_signed_url(self, stored_path: str, expires_in: int = 3600) -> str:
        """Return auth-gated file serve URL."""
        return f"/files/{stored_path}"
