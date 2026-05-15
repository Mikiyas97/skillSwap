from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from .models import Session, Review
from .serializers import (
    SessionSerializer,
    SessionCreateSerializer,
    ReviewSerializer,
    ReviewCreateSerializer,
)


class SessionListView(generics.ListAPIView):
    """List all sessions for the current user (as tutor or student)."""
    serializer_class = SessionSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Session.objects.filter(
            Q(tutor=user) | Q(student=user)
        ).select_related('tutor', 'student', 'listing')

        # Optional status filter
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        return qs


class SessionCreateView(generics.CreateAPIView):
    """Book a new session."""
    serializer_class = SessionCreateSerializer


class SessionDetailView(generics.RetrieveAPIView):
    """Get session details."""
    serializer_class = SessionSerializer

    def get_queryset(self):
        user = self.request.user
        return Session.objects.filter(Q(tutor=user) | Q(student=user))


@api_view(['POST'])
def complete_session(request, pk):
    """Mark a session as completed. Only the tutor can do this."""
    try:
        session = Session.objects.get(pk=pk, tutor=request.user)
    except Session.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

    if session.status == 'completed':
        return Response({'error': 'Session already completed'}, status=status.HTTP_400_BAD_REQUEST)

    session.complete()
    return Response(SessionSerializer(session).data)


@api_view(['POST'])
def cancel_session(request, pk):
    """Cancel a session. Either tutor or student can cancel."""
    try:
        session = Session.objects.get(
            Q(tutor=request.user) | Q(student=request.user), pk=pk
        )
    except Session.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

    if session.status in ['completed', 'cancelled']:
        return Response({'error': 'Cannot cancel this session'}, status=status.HTTP_400_BAD_REQUEST)

    session.status = 'cancelled'
    session.save(update_fields=['status'])
    return Response(SessionSerializer(session).data)


class ReviewCreateView(generics.CreateAPIView):
    """Leave a review for a completed session."""
    serializer_class = ReviewCreateSerializer

    def perform_create(self, serializer):
        session_id = self.kwargs['session_id']
        try:
            session = Session.objects.get(pk=session_id, student=self.request.user, status='completed')
        except Session.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError('Session not found or not completed')

        if hasattr(session, 'review'):
            from rest_framework.exceptions import ValidationError
            raise ValidationError('Review already exists for this session')

        serializer.save(session=session, student=self.request.user)


class TutorReviewsView(generics.ListAPIView):
    """List all reviews for a specific tutor. Public."""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        tutor_id = self.kwargs['tutor_id']
        return Review.objects.filter(
            session__tutor_id=tutor_id
        ).select_related('student', 'session')
