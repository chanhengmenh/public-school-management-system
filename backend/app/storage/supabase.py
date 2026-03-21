from app.storage.base import StorageBackend
from app.config import settings
import uuid


class SupabaseStorageBackend(StorageBackend):
    """Production storage using Supabase Storage bucket."""

    def __init__(self):
        try:
            from supabase import create_client
            self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            self.bucket = settings.SUPABASE_STORAGE_BUCKET
        except ImportError:
            raise RuntimeError("Install supabase-py: pip install supabase")

    async def save(self, file_bytes: bytes, filename: str, folder: str = "uploads") -> str:
        stored_path = f"{folder}/{uuid.uuid4()}_{filename}"
        self.client.storage.from_(self.bucket).upload(stored_path, file_bytes)
        return stored_path

    async def get_url(self, stored_path: str) -> str:
        return self.client.storage.from_(self.bucket).get_public_url(stored_path)

    async def delete(self, stored_path: str) -> None:
        self.client.storage.from_(self.bucket).remove([stored_path])
