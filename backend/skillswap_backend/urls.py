"""
SkillSwap DBU Backend — URL Configuration
"""

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
