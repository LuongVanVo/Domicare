from django.urls import path
from controllers import dashboard_controller

urlpatterns = [
    path('summary', dashboard_controller.get_dashboard_summary, name='dashboard summary'),
    path('chart', dashboard_controller.get_revenue_chart, name='dashboard chart'),
    path('topsale', dashboard_controller.get_top_sale, name='dashboard top sale'),
]