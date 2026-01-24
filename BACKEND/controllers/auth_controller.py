import json
import logging
import requests

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from pydantic import ValidationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from django.http import HttpResponseRedirect

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
    
@api_view(['GET'])
@permission_classes([AllowAny])
def google_oauth2_callback(request):
    """Handle Google OAuth2 callback"""
    authorization_code = request.GET.get('code')
    
    if not authorization_code:
        logger.error("[AuthController] No authorization code received from Google")
        return HttpResponseRedirect(
            f"{settings.FRONTEND_URL}/login?error=missing_authorization_code"
        )
    try:
        token_response = exchange_code_for_token(authorization_code)
        google_access_token = token_response.get('access_token')
        
        if not google_access_token:
            logger.error("[AuthController] Failed to get access token from Google")
            return HttpResponseRedirect(
                f"{settings.FRONTEND_URL}/login?error=google_oauth2_token_failed"
            )
        
        user_info = get_google_user_info(google_access_token)
        
        email = user_info.get('email')
        name = user_info.get('name')
        picture = user_info.get('picture')
        locale = user_info.get('locale')
        google_id = user_info.get('sub')
        
        if not email:
            logger.error("[AuthController] Email not found in Google user info")
            return HttpResponseRedirect(
                f"{settings.FRONTEND_URL}/login?error=google_oauth2_no_email"
            )
        
        access_token, refresh_token, user = auth_service.handle_google_oauth2(
            email=email,
            name=name,
            picture=picture,
            locale=locale,
            google_id=google_id
        )
        
        redirect_url = (
            f"{settings.FRONTEND_URL}/"
            f"?access_token={access_token}"
            f"&refresh_token={refresh_token}"
        )
        
        logger.info(f"[OAuth] Success - Redirecting to: {redirect_url[:80]}...")
        return HttpResponseRedirect(redirect_url)
    
    except requests.RequestException as e:
        logger.error(f"[AuthController] Request error: {str(e)}")
        return HttpResponseRedirect(
            f"{settings.FRONTEND_URL}/login?error=google_oauth2_request_failed"
        )
    except Exception as e:
        logger.error(f"[AuthController] Exception during Google OAuth2 callback: {str(e)}")
        return HttpResponseRedirect(
            f"{settings.FRONTEND_URL}/login?error=processing_error"
        )
    
def exchange_code_for_token(authorization_code: str) -> dict:
    """Exchange authorization code for access token"""
    data = {
        'code': authorization_code,
        'client_id': settings.GOOGLE_CLIENT_ID,
        'client_secret': settings.GOOGLE_CLIENT_SECRET,
        'redirect_uri': settings.GOOGLE_REDIRECT_URI,
        'grant_type': 'authorization_code'
    }
    
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    response = requests.post(
        settings.GOOGLE_TOKEN_URL,
        data=data,
        headers=headers,
        timeout=10
    )
    
    response.raise_for_status()
    return response.json()

def get_google_user_info(access_token: str) -> dict:
    """Get user info from Google API using access token"""
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    response = requests.get(
        settings.GOOGLE_USERINFO_URL,
        headers=headers,
        timeout=10
    )
    
    response.raise_for_status()
    return response.json()