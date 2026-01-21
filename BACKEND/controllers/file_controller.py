import logging

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from decorators.auth_required import jwt_required
from exceptions.file_exceptions import FileUploadException, FileNotFoundException
from services.file_service import FileService
from utils.format_response import FormatRestResponse
from rest_framework import status as http_status

logger = logging.getLogger(__name__)

file_service = FileService()

@csrf_exempt
@permission_classes([IsAuthenticated])
@api_view(['POST'])
def upload_file(request):
    """Upload file to Cloudinary"""
    try:
        if 'file' not in request.FILES:
            return JsonResponse(FormatRestResponse.error(message="No file provided"), status=http_status.HTTP_400_BAD_REQUEST)
        file = request.FILES['file']
        unique_name = request.POST.get('name', file.name)

        # Upload file
        file_dto = file_service.upload_file(file, unique_name)
        return JsonResponse(FormatRestResponse.success(
            data=file_dto.dict(),
            message='File upload successfully',
        ), status=http_status.HTTP_201_CREATED)
    except FileUploadException as e:
        return JsonResponse(
            FormatRestResponse.error(
                message="No file provided"),
                status=http_status.HTTP_400_BAD_REQUEST
            )
    except Exception as e:
        logger.error(f"[FileController] Error uploading file: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(
                message="Internal server error"
            ),
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(['GET'])
def get_file_by_id(request, file_id: int):
    """Get file by ID - No authentication required"""
    try:
        file_dto = file_service.fetch_file_by_id(file_id)
        return JsonResponse(FormatRestResponse.success(data=file_dto.dict()), status=http_status.HTTP_200_OK)
    except FileNotFoundException as e:
        return JsonResponse(FormatRestResponse.error(message=str(e)), status=http_status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"[FileController] Error getting file: {str(e)}")
        return JsonResponse(FormatRestResponse.error(message="Internal server error"),
                            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_file(request, file_id: int):
    """Delete file by ID - Authentication required"""
    try:
        file_service.delete_file(file_id)
        return JsonResponse(FormatRestResponse.success(message='File deleted successfully'),
                            status=http_status.HTTP_200_OK)
    except FileNotFoundException as e:
        return JsonResponse(FormatRestResponse.error(message=str(e)), status=http_status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"[FileController] Error deleting file: {str(e)}")
        return JsonResponse(FormatRestResponse.error(message="Internal server error"),
                            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_all_files(request):
    """Get all files"""
    try:
        files = file_service.fetch_all_files()
        files_dict = [f.dict() for f in files]

        return JsonResponse(FormatRestResponse.success(data=files_dict), status=http_status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"[FileController] Error getting files: {str(e)}")
        return JsonResponse(FormatRestResponse.error(message="Internal server error"), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)