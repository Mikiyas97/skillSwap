from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.ProfileView.as_view(), name='user-profile'),
    path('<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('leaderboard/', views.LeaderboardView.as_view(), name='leaderboard'),
]
