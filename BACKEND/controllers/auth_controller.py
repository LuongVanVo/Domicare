import json
import logging

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from pydantic import ValidationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request

from dtos.auth.login_request import LoginRequest
from dtos.auth.refresh_token_request import RefreshTokenRequest
from dtos.auth.register_request import RegisterRequest
from exceptions.auth_exceptions import InvalidRefreshTokenException
from exceptions.user_exceptions import EmailAlreadyExistsException, UserNotFoundException
from services.auth_service import AuthService
from utils.rest_response import RestResponse
from services.jwt_service import JwtService
from rest_framework import status as http_status
from utils.format_response import FormatRestResponse

auth_service = AuthService()
logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request: Request):
    try:
        login_request = LoginRequest(**request.data)
        login_response = auth_service.login(login_request)

        return RestResponse.success(
            data={
                'access_token': login_response.access_token,
                'refresh_token': login_response.refresh_token,
                'user': login_response.user.model_dump(by_alias=True, exclude={'password'})
            }
        )
    except ValidationError as e:
        logger.warning(f"[Auth] Validation error during login: {str(e)}")
        raise
    except Exception as e:
        logger.warning(f"[Auth] Exception during login: {str(e)}")
        raise

@api_view(['POST'])
def logout(request: Request):
    try:
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return RestResponse.error(message="Missing or invalid authorization header", status=http_status.HTTP_401_UNAUTHORIZED)
        
        token = auth_header.replace('Bearer ', '')
        
        # Decode token để lấy email
        jwt_service = JwtService()
        payload = jwt_service.verify_access_token(token)
        email = payload.get('email')
        
        if email: 
            auth_service.logout(email)
        
        return RestResponse.success(message="Logged out successfully")
    except Exception as e:
        logger.error(f"[Auth] Logout error: {e}")
        return RestResponse.error(message="Logout failed", status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

# register
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request: Request):
    try:
        data = json.loads(request.body)
        register_request = RegisterRequest(
            email=data.get('email'),
            password=data.get('password')
        )

        response = auth_service.register(register_request)

        return JsonResponse(FormatRestResponse.success(
            data={
                'id': response.id,
                'email': response.email,
            },
            message=response.message
        ), status=http_status.HTTP_201_CREATED)

    except EmailAlreadyExistsException as e:
        return JsonResponse(FormatRestResponse.error(str(e)), status=http_status.HTTP_409_CONFLICT)
    except Exception as e:
        return JsonResponse(FormatRestResponse.error(str(e)), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

# refresh token
@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request: Request):
    try:
        data = json.loads(request.body)
        refresh_request = RefreshTokenRequest(
            refresh_token=data.get('refresh_token')
        )

        response = auth_service.refresh_token(refresh_request)
        return JsonResponse(FormatRestResponse.success(
            data={
                'access_token': response.access_token,
                'email': response.email
            }
        ), status=http_status.HTTP_200_OK)
    except InvalidRefreshTokenException as e:
        return JsonResponse(FormatRestResponse.error(str(e)), status=http_status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        logger.error(f"[AuthController] Refresh token error: {e}")
        return JsonResponse(FormatRestResponse.error(str(e)), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

# reset password
@csrf_exempt
@require_http_methods(["POST"])
def reset_password(request: Request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        auth_service.reset_password(email, password)
        return JsonResponse(FormatRestResponse.success(
            message="Password reset successfully"
        ), status=http_status.HTTP_200_OK)
    except UserNotFoundException as e:
        return JsonResponse(FormatRestResponse.error(str(e)), status=http_status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"[AuthController] Reset password error: {e}")
        return JsonResponse(FormatRestResponse.error(str(e)), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

# verify email
@require_http_methods(["GET"])
def verify_email(request: Request):
    try:
        token = request.GET.get('token')
        auth_service.verify_email(token)

        return render(request, 'confirm_success.html', {
            'frontend_url': settings.FRONTEND_URL,
            'logo_url': settings.LOGO_URL
        })

    except Exception as e:
        logger.error(f"[AuthController] Email verification error: {e}")
        return JsonResponse(FormatRestResponse.error(str(e)), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

# forgot password
@csrf_exempt
@require_http_methods(["GET"])
def forgot_password(request: Request):
    try:
        token = request.GET.get('token')
        # verify token and get email
        user = auth_service.user_repo.find_by_email_confirmation_token(token)

        if not user:
            raise Exception("Invalid or expired token")

        # return html form
        return render(request, 'fill_password.html', {
            'email': user.email,
            'frontend_url': settings.FRONTEND_URL,
            'backend_url': settings.BACKEND_URL,
            'logo_url': settings.LOGO_URL,
        })

    except Exception as e:
        logger.error(f"[AuthController] Forgot password error: {e}")
        return JsonResponse(FormatRestResponse.error(str(e)), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

# send verification email
@require_http_methods(["GET"])
def send_verification_email(request):
    try:
        email = request.GET.get('email')
        auth_service.email_service.send_verification_email(email)

        return JsonResponse(FormatRestResponse.success(
            message="Verification email sent"
        ), status=http_status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"[Controller] Send verification email error: {e}")
        return JsonResponse(FormatRestResponse.error("Failed to send email"), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

# send reset password email
@require_http_methods(["GET"])
def send_reset_password_email(request):
    try:
        email = request.GET.get('email')
        auth_service.send_reset_password_email(email)

        return JsonResponse(FormatRestResponse.success(
            message="Reset password email sent"
        ), status=http_status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"[Controller] Send reset password email error: {e}")
        return JsonResponse(FormatRestResponse.error("Failed to send email"), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)