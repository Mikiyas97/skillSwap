from rest_framework import serializers
from .models import Message, Conversation
from users.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'text', 'is_read', 'timestamp']
        read_only_fields = ['id', 'sender', 'is_read', 'timestamp']


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['receiver', 'text']

    def validate(self, data):
        user = self.context['request'].user
        if data['receiver'] == user:
            raise serializers.ValidationError('You cannot send a message to yourself')
        return data

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        message = super().create(validated_data)

        # Update or create conversation
        sender = message.sender
        receiver = message.receiver
        conversation = Conversation.objects.filter(
            participants=sender
        ).filter(
            participants=receiver
        ).first()

        if not conversation:
            conversation = Conversation.objects.create()
            conversation.participants.add(sender, receiver)

        conversation.last_message = message
        conversation.save(update_fields=['last_message', 'updated_at'])

        return message


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = MessageSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'last_message', 'unread_count', 'updated_at']

    def get_unread_count(self, obj):
        user = self.context.get('request')
        if user and hasattr(user, 'user'):
            return Message.objects.filter(
                receiver=user.user,
                sender__in=obj.participants.all(),
                is_read=False,
            ).count()
        return 0
