import logging
from typing import Optional, List

from models.file import File

logger = logging.getLogger(__name__)

class FileRepository:
    @staticmethod
    def find_by_id(file_id: int) -> Optional[File]:
        """Find file by ID"""
        try:
            return File.objects.get(id=file_id)
        except File.DoesNotExist:
            return None

    @staticmethod
    def find_by_name(name: str) -> Optional[File]:
        """Find file by name"""
        try:
            return File.objects.get(name=name, is_deleted=False)
        except File.DoesNotExist:
            return None

    @staticmethod
    def find_by_url(url: str) -> Optional[File]:
        """Find file by URL"""
        try:
            return File.objects.get(url=url, is_deleted=False)
        except File.DoesNotExist:
            return None

    @staticmethod
    def find_by_urls(urls: List[str]) -> List[File]:
        """Find file by URLs"""
        return list(File.objects.filter(url__in=urls, is_deleted=False))

    @staticmethod
    def exists_by_name(name: str) -> bool:
        """Check if file exists with given name"""
        return File.objects.filter(name=name, is_deleted=False).exists()

    @staticmethod
    def exists_by_url(url: str) -> bool:
        """Check if file exists with given URL"""
        return File.objects.filter(url=url, is_deleted=False).exists()

    @staticmethod
    def save(file: File) -> File:
        """Save or update file"""
        file.save()
        return file

    @staticmethod
    def delete(file: File) -> None:
        """Hard delete file from database"""
        file.delete()

    @staticmethod
    def soft_delete_by_id(file_id: int) -> None:
        """Soft delete file by setting is_deleted=True"""
        File.objects.filter(id=file_id).update(is_deleted=True)

    @staticmethod
    def find_all() -> List[File]:
        """Find all files not deleted"""
        return list(File.objects.filter(is_deleted=False))