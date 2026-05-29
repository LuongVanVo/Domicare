"""WebSocket Routing Configuration"""
from django.urls import path
from consumers.domicare_consumer import DomicareConsumer

websocket_urlpatterns = [
    path('api/v1/ws', DomicareConsumer.as_asgi()),
]
