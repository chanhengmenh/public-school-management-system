from fastapi import HTTPException
from supabase import create_client
from app.storage import StorageBackend
from app.config import settings


class SupabaseStorageBackend(StorageBackend):
    """Supabase storage backend using private bucket + signed URLs."""

    def __init__(self):
        self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        self.bucket_name = settings.SUPABASE_STORAGE_BUCKET

    async def save(self, content: bytes, filename: str, resource_type: str, resource_id: int, content_type: str | None = None) -> str:
        """Save file to Supabase and return stored_path."""
        stored_path = self.generate_path(resource_type, resource_id, filename)
        file_options = {"content-type": content_type} if content_type else {}
        response = self.client.storage.from_(self.bucket_name).upload(stored_path, content, file_options=file_options)
        if hasattr(response, "error") and response.error:
            raise HTTPException(status_code=500, detail=f"Storage upload failed: {response.error}")
        return stored_path

    def get_signed_url(self, stored_path: str, expires_in: int = 3600) -> str:
        """Get a signed URL from Supabase (private bucket)."""
        response = self.client.storage.from_(self.bucket_name).create_signed_url(stored_path, expires_in)
        # supabase-py v1 returns dict; v2 returns object with .data
        if isinstance(response, dict):
            return response.get("signedURL") or response.get("signedUrl", "")
        if hasattr(response, "data") and response.data:
            return response.data.get("signedURL") or response.data.get("signedUrl", "")
        return ""
