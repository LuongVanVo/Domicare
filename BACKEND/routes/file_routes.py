from django.urls import path
from controllers import file_controller

urlpatterns = [
    path('upload', file_controller.upload_file, name='upload_file'),
    path('files', file_controller.get_all_files, name='get_all_files'),
    path('<int:file_id>', file_controller.get_file_by_id, name='get_file_by_id'),
    path('delete/<int:file_id>', file_controller.delete_file, name='delete_file'),
]