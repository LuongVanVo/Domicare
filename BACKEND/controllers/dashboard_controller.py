from dataclasses import asdict
from datetime import datetime

from rest_framework import status as http_status
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from dtos.dashboard_dtos import LocalDateRequest
from services.dashboard_service import DashboardService
from utils.format_response import FormatRestResponse

dashboard_service = DashboardService()

def _convert_dto_to_dict(dto):
    """Convert DTO to dictionary for JSON response"""
    if hasattr(dto, '__dataclass_fields__'):
        result = {}
        for key, value in asdict(dto).items():
            if hasattr(value, '__dataclass_fields__'):
                result[key] = _convert_dto_to_dict(value)
            elif isinstance(value, dict):
                result[key] = {
                    k: _convert_dto_to_dict(v) if hasattr(v, '__dataclass_fields__') else v
                    for k, v in value.items()
                }
            elif isinstance(value, list):
                result[key] = [
                    _convert_dto_to_dict(item) if hasattr(item, '__dataclass_fields__') else item
                    for item in value
                ]
            else:
                result[key] = value
        return result
    return dto


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_dashboard_summary(request):
    """Get dashboard summary with metrics and booking overview"""
    try:
        start_date_str = request.data.get('startDate')
        end_date_str = request.data.get('endDate')

        if not start_date_str or not end_date_str:
            return JsonResponse(
                FormatRestResponse.error("[DashboardController] 'start_date' and 'end_date' are required."),
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))

        local_date_request = LocalDateRequest(
            start_date=start_date,
            end_date=end_date
        )
        local_date_request.validate()

        # Get summary
        summary = dashboard_service.get_dashboard_summary(
            local_date_request.start_date,
            local_date_request.end_date
        )

        # Convert to camelCase dict
        response_data = summary.to_camel_dict()

        return JsonResponse(
            FormatRestResponse.success(
                data=response_data,
                message="Dashboard summary fetched successfully."
            ),
            status=http_status.HTTP_200_OK
        )
    except ValueError as e:
        return JsonResponse(
            FormatRestResponse.error("[DashboardController] Invalid input: " + str(e)),
            status=http_status.HTTP_400_BAD_REQUEST,
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_revenue_chart(request):
    """Get revenue chart data for the last 12 months"""
    try:
        chart_data = dashboard_service.get_total_revenue_12_months()

        # Convert to camelCase dict
        response_data = chart_data.to_camel_dict()

        return JsonResponse(
            FormatRestResponse.success(
                data=response_data,
                message="Revenue chart data fetched successfully."
            ),
            status=http_status.HTTP_200_OK
        )
    except Exception as e:
        return JsonResponse(
            FormatRestResponse.error(f"[DashboardController] Error: {str(e)}"),
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_top_sale(request):
    """Get top 5 sales staff by performance"""
    try:
        start_date_str = request.data.get('startDate')
        end_date_str = request.data.get('endDate')

        if not start_date_str or not end_date_str:
            return JsonResponse(
                FormatRestResponse.error("[DashboardController] 'start_date' and 'end_date' are required."),
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))

        local_date_request = LocalDateRequest(
            start_date=start_date,
            end_date=end_date
        )
        local_date_request.validate()

        # Get top sale
        top_sales = dashboard_service.get_top_sale(local_date_request.start_date, local_date_request.end_date)

        # Convert to camelCase dicts
        response_data = [sale.to_camel_dict() for sale in top_sales]

        return JsonResponse(
            FormatRestResponse.success(
                data=response_data,
                message="Top sales staff fetched successfully."
            ),
            status=http_status.HTTP_200_OK
        )
    except ValueError as e:
        return JsonResponse(
            FormatRestResponse.error("[DashboardController] Invalid input: " + str(e)),
            status=http_status.HTTP_400_BAD_REQUEST,
        )