from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer, UserUpdateSerializer, LeaderboardSerializer


class ProfileView(generics.RetrieveUpdateAPIView, generics.CreateAPIView):
    """Get, update, or create the current user's profile."""

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH', 'POST']:
            return UserUpdateSerializer
        return UserSerializer

    def get_object(self):
        if not self.request.user.pk:
            from rest_framework.exceptions import NotFound
            raise NotFound('Profile not found')
        return self.request.user

    def post(self, request, *args, **kwargs):
        if request.user.pk:
            return Response({'error': 'Profile already exists'}, status=status.HTTP_409_CONFLICT)
        
        user = request.user
        
        # Populate from request data
        name = request.data.get('full_name', request.data.get('name', ''))
        if name:
            parts = name.split(' ', 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ''
            
        user.college = request.data.get('college', '')
        user.department = request.data.get('department', '')
        user.year = request.data.get('year', '')
        user.bio = request.data.get('bio', '')
        user.avatar = request.data.get('profile_picture', request.data.get('avatar', ''))
        
        user.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


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
