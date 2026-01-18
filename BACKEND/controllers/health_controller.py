import logging

from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

logger = logging.getLogger(__name__)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def health_check(request):
    """
    Health check endpoint to verify that the application is running.
    """
    logger.info(f"Health check requested by user {request.user}.")
    user = request.user.email
    return JsonResponse({"status": "ok", "user": user}, status=200)