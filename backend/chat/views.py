from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from .models import Message, Conversation
from .serializers import (
    MessageSerializer,
    MessageCreateSerializer,
    ConversationSerializer,
)


class ConversationListView(generics.ListAPIView):
    """List all conversations for the current user."""
    serializer_class = ConversationSerializer

    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants')


class MessageListView(generics.ListAPIView):
    """List messages between current user and another user."""
    serializer_class = MessageSerializer

    def get_queryset(self):
        other_user_id = self.kwargs['user_id']
        user = self.request.user
        return Message.objects.filter(
            Q(sender=user, receiver_id=other_user_id) |
            Q(sender_id=other_user_id, receiver=user)
        ).select_related('sender')


class MessageCreateView(generics.CreateAPIView):
    """Send a new message."""
    serializer_class = MessageCreateSerializer


@api_view(['POST'])
def mark_messages_read(request, user_id):
    """Mark all messages from a specific user as read."""
    count = Message.objects.filter(
        sender_id=user_id,
        receiver=request.user,
        is_read=False,
    ).update(is_read=True)
    return Response({'marked_read': count})
