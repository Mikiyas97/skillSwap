from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer, UserUpdateSerializer, LeaderboardSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get or update the current user's profile."""

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user


class UserDetailView(generics.RetrieveAPIView):
    """Get any user's public profile by ID."""
    serializer_class = UserSerializer
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]


class LeaderboardView(generics.ListAPIView):
    """Top tutors ranked by score (sessions + rating)."""
    serializer_class = LeaderboardSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return User.objects.filter(
            sessions_completed__gt=0
        ).order_by('-sessions_completed', '-rating')[:20]


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    """Health check endpoint for Railway/deployment."""
    return Response({'status': 'ok', 'service': 'SkillSwap DBU API'})
