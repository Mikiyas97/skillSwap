"""
SkillSwap DBU Backend — URL Configuration
"""
# Note: This is a simplified URL configuration for development and demonstration purposes. In production, you should organize URLs more modularly and securely.
from django.contrib import admin
from django.urls import path, include
from users.views import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/users/', include('users.urls')),
    path('api/skills/', include('skills.urls')),
    path('api/sessions/', include('tutoring.urls')),
    path('api/chat/', include('chat.urls')),
]
