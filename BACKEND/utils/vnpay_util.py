import hashlib
import logging
import hmac
import random
import string
from datetime import datetime
from urllib.parse import quote

import pytz

logger = logging.getLogger(__name__)
class VNPayUtil:
    """VNPay utility function"""
    @staticmethod
    def hmac_sha512(key: str, data: str) -> str:
        """Hash data using HmacSHA512 - VNPay standard"""
        try:
            if not key or not data:
                raise ValueError("Key and data must not be None")

            # Create HMAC-SHA512 hash
            hmac_obj = hmac.new(
                key.encode('utf-8'),
                data.encode('utf-8'),
                hashlib.sha512
            )

            return hmac_obj.hexdigest()
        except Exception as e:
            logger.error(f"Error hashing data with HmacSHA512: {str(e)}")
            return ""

    @staticmethod
    def hash_all_fields(fields: dict) -> str:
        """Build hash data from parameters - NO URL encoding for hash"""
        # Sorted fields by key
        sorted_fields = sorted(fields.items())

        # Build hash data - use raw values WITHOUT encoding
        hash_data = []
        for key, value in sorted_fields:
            if value is not None and str(value):
                # NO URL encoding - use raw value
                hash_data.append(f"{key}={value}")

        return '&'.join(hash_data)

    @staticmethod
    def build_hash_data_and_query(vnp_params: dict) -> tuple:
        """Build hash data and query string, return both"""
        # sorted parameters by key
        sorted_params = sorted(vnp_params.items())

        hash_data_parts = []
        query_parts = []

        for key, value in sorted_params:
            if value is not None and str(value):
                # Hash data: NO encoding - use raw value
                hash_data_parts.append(f"{key}={value}")

                # Query string: WITH encoding
                encoded_value = quote(str(value), safe='')
                encoded_key = quote(str(key), safe='')
                query_parts.append(f"{encoded_key}={encoded_value}")

        hash_data = '&'.join(hash_data_parts)
        query_string = '&'.join(query_parts)

        return hash_data, query_string

    @staticmethod
    def get_random_number(length: int) -> str:
        """Get random number with specified length"""
        return ''.join(random.choices(string.digits, k=length))

    @staticmethod
    def format_date(dt: datetime = None) -> str:
        """Format date to VNPay format (yyyyMMddHHmmss) - VNPay requires Asia/Ho_Chi_Minh timezone (GMT+7)"""
        if dt is None:
            dt = datetime.now()

        # Convert to Vietnam timezone
        vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')
        if dt.tzinfo is None:
            dt = vn_tz.localize(dt)
        else:
            dt = dt.astimezone(vn_tz)

        return dt.strftime('%Y%m%d%H%M%S')

    @staticmethod
    def get_ip_address(request) -> str:
        """Get IP address from request"""
        try:
            # Try to get real IP from proxy headers
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0].strip()
            else:
                ip = request.META.get('REMOTE_ADDR')

            return ip if ip else '127.0.0.1'
        except Exception as e:
            logger.error(f"Error getting IP address: {str(e)}")
            return f"Invalid IP: {str(e)}"
