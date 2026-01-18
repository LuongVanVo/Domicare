"""Format Response Utility"""
from typing import Any, Optional


class FormatRestResponse:
    """
    Format REST API responses
    Matches FormatRestResponse.java
    """

    @staticmethod
    def success(data: Any = None, message: str = "Success") -> dict:
        """Format success response"""
        return {
            'success': True,
            'message': message,
            'data': data
        }

    @staticmethod
    def created(data: Any = None, message: str = "Created successfully") -> dict:
        """Format created response"""
        return FormatRestResponse.success(data, message)

    @staticmethod
    def error(message: str = "Error occurred", errors: Optional[dict] = None) -> dict:
        """Format error response"""
        return {
            'success': False,
            'message': message,
            'errors': errors
        }

    @staticmethod
    def paginated(data: list, total: int, page: int, page_size: int, message: str = "Success") -> dict:
        """Format paginated response"""
        return {
            'success': True,
            'message': message,
            'data': data,
            'pagination': {
                'total': total,
                'page': page,
                'page_size': page_size,
                'total_pages': (total + page_size - 1) // page_size
            }
        }