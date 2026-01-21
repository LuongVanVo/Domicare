import logging
from typing import List, Optional
import re

import cloudinary.uploader

from dtos.file_dto import FileDTO
from dtos.responses.image_response import ImageResponse
from exceptions.file_exceptions import FileUploadException, FileNotFoundException
from middlewares.current_user import get_current_user
from repositories.file_repository import FileRepository
from models.file import File

logger = logging.getLogger(__name__)
class FileService:
    def __init__(self):
        self.file_repo = FileRepository()

    def upload_file(self, file, unique_name: str) -> FileDTO:
        """Upload file to Cloudinary and save metadata"""
        try:
            logger.info(f"[File] Uploading file: {unique_name}")

            # upload to cloudinary
            upload_result = cloudinary.uploader.upload(file)

            url = upload_result["url"]
            resource_type = upload_result["resource_type"]
            file_size = str(file.size) if hasattr(file, 'size') else '0'

            if not url or not resource_type:
                raise FileUploadException("[File] Failed to upload file to Cloudinary")

            # Check if URL already exists
            if self.file_repo.exists_by_url(url):
                logger.warning(f"[File] Duplicate URL found: {url}, deleting from Cloudinary")
                try:
                    public_id = self._extract_public_id_from_url(url)
                    cloudinary.uploader.destroy(public_id)
                    logger.info(f"[File] Deleted duplicate file from Cloudinary: {public_id}")
                except Exception as e:
                    logger.error(f"[File] Error deleting duplicate file from Cloudinary: {str(e)}")
                raise FileUploadException("File with the same URL already exists")

            # Create file entity
            file_entity = File()
            file_entity.url = url
            file_entity.name = unique_name
            file_entity.type = resource_type
            file_entity.size = file_size
            file_entity.is_deleted = False

            # Set audit fields
            current_user = get_current_user()
            file_entity.create_by = current_user or "system"

            # Save to database
            saved_file = self.file_repo.save(file_entity)
            logger.info(f"[File] File uploaded successfully with ID: {saved_file.id}")

            return self._convert_to_dto(saved_file)

        except FileUploadException:
            raise
        except Exception as e:
            logger.error(f"[File] Error uploading file: {str(e)}")
            raise FileUploadException(f"[File] Error uploading file: {str(e)}")

    def fetch_file_by_id(self, file_id: str) -> FileDTO:
        """Fetch file by ID"""
        logger.info(f"[File] Fetching file with ID: {file_id}")

        file = self.file_repo.find_by_id(file_id)
        if not file or file.is_deleted:
            logger.error(f"[File] File not found with ID: {file_id}")
            raise FileNotFoundException(f"File not found with ID: {file_id}")

        return self._convert_to_dto(file)

    def fetch_file_by_name(self, name: str) -> FileDTO:
        """Fetch file by name"""
        logger.info(f"[File] Fetching file with name: {name}")

        file = self.file_repo.find_by_name(name)
        if not file:
            logger.error(f"[File] File not found with name: {name}")
            raise FileNotFoundException(f"File not found with name: {name}")

        return self._convert_to_dto(file)

    def delete_file(self, file_id: str) -> FileDTO:
        """Delete file from Cloudinary and database"""
        logger.info(f"[File] Deleting file with ID: {file_id}")

        # Find file
        file = self.file_repo.find_by_id(file_id)
        if not file:
            logger.error(f"[File] File not found with ID: {file_id}")
            raise FileNotFoundException(f"File not found with ID: {file_id}")

        # Extract public_id from URL
        public_id = self._extract_public_id_from_url(file.url)

        try:
            # Delete from Cloudinary
            cloudinary.uploader.destroy(public_id)
            logger.info(f"[File] File with public_id {public_id} deleted from Cloudinary")

            # Delete from Database
            self.file_repo.delete(file)
            logger.info(f"[File] File with ID {file_id} deleted from database")
        except Exception as e:
            logger.error(f"[File] Error deleting fiile from Cloudinary: {str(e)}")
            raise FileUploadException(f"[File] Error deleting fiile: {str(e)}")

    def fetch_all_files(self) -> List[FileDTO]:
        """Fetch all file"""
        logger.info(f"[File] Fetching all files")
        files = self.file_repo.find_all()
        return [self._convert_to_dto(f) for f in files]

    def find_by_url(self, url: str) -> ImageResponse:
        """Find file by URL"""
        logger.info(f"[File] Finding file by URL: {url}")
        file = self.file_repo.find_by_url(url)
        if not file:
            logger.error(f"[File] File not found with URL: {url}")
            raise FileNotFoundException(f"File not found with URL: {url}")

        return self._convert_to_image_response(file)

    def find_by_urls(self, urls: List[str]) -> List[ImageResponse]:
        """Find files by list of URLs"""
        logger.info(f"[File] Finding file by URLs: {urls}")

        files = self.file_repo.find_by_urls(urls)
        if not files:
            logger.error(f"[File] File not found with URLs: {urls}")
            raise FileNotFoundException(f"File not found with URLs: {urls}")

        return [self._convert_to_image_response(f) for f in files]

    @staticmethod
    def _extract_public_id_from_url(file_url: str) -> Optional[str]:
        """
        Extract Cloudinary public_id from URL
        Tương đương: extractPublicIdFromUrl()

        Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg
        Returns: sample
        """
        try:
            # Match pattern: /v{version}/{public_id}.{extension}
            pattern = r'/v\d+/([^.]+)'
            match = re.search(pattern, file_url)
            if match:
                return match.group(1)
            return None
        except Exception as e:
            logger.error(f"[File] Error extracting public_id from URL: {str(e)}")
            return None

    @staticmethod
    def _convert_to_dto(file: File) -> FileDTO:
        """Convert File entity to FileDTO"""
        return FileDTO(
            id=file.id,
            url=file.url,
            name=file.name,
            type=file.type,
            size=file.size,
            create_by=file.create_by.email if hasattr(file.create_by, 'email') else file.create_by,
            update_by=file.update_by.email if hasattr(file.update_by, 'email') else file.update_by,
            created_at=file.created_at,
            updated_at=file.updated_at
        )

    @staticmethod
    def _convert_to_image_response(file: File) -> ImageResponse:
        """Convert File entity to ImageResponse"""
        return ImageResponse(
            url=file.url,
            name=file.name,
            type=file.type
        )