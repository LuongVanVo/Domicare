from dataclasses import dataclass
from typing import Optional

@dataclass
class VNPayPaymentRequest:
    order_id: str
    amount: int
    order_info: str

    def validate(self):
        """Validate payment request data"""
        if not self.order_id or not isinstance(self.order_id, str):
            raise ValueError("order_id must be a non-empty string")
        
        if not isinstance(self.amount, int) or self.amount <= 0:
            raise ValueError("amount must be a positive integer")
        
        if not self.order_info or not isinstance(self.order_info, str):
            raise ValueError("order_info must be a non-empty string")

@dataclass
class VNPayPaymentResponse:
    payment_url: str
    
    

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'paymentUrl': self.payment_url
        }

@dataclass
class VNPayReturnResponse:
    status: str
    message: str
    order_id: Optional[str] = None
    amount: Optional[int] = None
    transaction_no: Optional[str] = None
    bank_code: Optional[str] = None
    pay_date: Optional[str] = None

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'status': self.status,
            'message': self.message,
            'order_id': self.order_id,
            'amount': self.amount,
            'transaction_no': self.transaction_no,
            'bank_code': self.bank_code,
            'pay_date': self.pay_date,
        }