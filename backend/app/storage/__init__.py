import uuid
import re
from abc import ABC, abstractmethod


class StorageBackend(ABC):
    """Abstract storage backend for file uploads."""

    def generate_path(self, resource_type: str, resource_id: int, filename: str) -> str:
        """Generate structured path: {resource_type}/{resource_id}/{uuid}_{sanitized_filename}"""
        sanitized = re.sub(r'[^\w\-\.]', '_', filename)
        unique_name = f"{uuid.uuid4().hex[:8]}_{sanitized}"
        return f"{resource_type}/{resource_id}/{unique_name}"

    @abstractmethod
    async def save(self, content: bytes, filename: str, resource_type: str, resource_id: int, content_type: str | None = None) -> str:
        """Save file and return stored_path."""
        pass

    @abstractmethod
    def get_signed_url(self, stored_path: str, expires_in: int = 3600) -> str:
        """Get a signed URL for the stored file."""
        pass
