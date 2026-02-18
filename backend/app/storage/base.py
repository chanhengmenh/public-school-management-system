from abc import ABC, abstractmethod


class StorageBackend(ABC):
    @abstractmethod
    async def save(self, file_bytes: bytes, filename: str, folder: str = "uploads") -> str:
        """Save file and return a stored path/key."""

    @abstractmethod
    async def get_url(self, stored_path: str) -> str:
        """Return a publicly accessible URL for the stored file."""

    @abstractmethod
    async def delete(self, stored_path: str) -> None:
        """Delete the file at stored_path."""
