from functools import wraps

from django.http import JsonResponse

from middlewares.jwt_authentication import JwtAuthenticationMiddleware
from utils.format_response import FormatRestResponse
from rest_framework import status as http_status

def jwt_required(view_func):
    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        auth_middleware = JwtAuthenticationMiddleware()
        try:
            user, token = auth_middleware.authenticate(request)
            if not user:
                return JsonResponse(
                    FormatRestResponse.error(message="Authentication required"),
                    status=http_status.HTTP_401_UNAUTHORIZED
                )
            request.user = user
            return view_func(self, request, *args, **kwargs)
        except Exception as e:
            return JsonResponse(
                FormatRestResponse.error(message=str(e)),
                status=http_status.HTTP_401_UNAUTHORIZED
            )

    return wrapper