"""
WebSocket consumer for real-time chat.
Handles connection, message sending, and typing indicators.
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from chat.models import Message, Conversation
from users.models import User


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time messaging."""

    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.other_user_id = self.scope['url_route']['kwargs']['other_user_id']

        # Create a consistent room name (smaller ID first)
        ids = sorted([str(self.user_id), str(self.other_user_id)])
        self.room_name = f'chat_{ids[0]}_{ids[1]}'

        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

        # Mark user as online
        await self.set_online(self.user_id, True)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_name, self.channel_name)
        await self.set_online(self.user_id, False)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type', 'message')

        if message_type == 'message':
            # Save message to database
            message = await self.save_message(
                sender_id=self.user_id,
                receiver_id=self.other_user_id,
                text=data['text'],
            )

            # Broadcast to room
            await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': 'chat_message',
                    'message': {
                        'id': message.id,
                        'sender_id': self.user_id,
                        'receiver_id': self.other_user_id,
                        'text': data['text'],
                        'timestamp': message.timestamp.isoformat(),
                    }
                }
            )

        elif message_type == 'typing':
            await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': 'typing_indicator',
                    'user_id': self.user_id,
                    'is_typing': data.get('is_typing', False),
                }
            )

    async def chat_message(self, event):
        """Send chat message to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
        }))

    async def typing_indicator(self, event):
        """Send typing indicator to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user_id': event['user_id'],
            'is_typing': event['is_typing'],
        }))

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, text):
        message = Message.objects.create(
            sender_id=sender_id,
            receiver_id=receiver_id,
            text=text,
        )
        # Update conversation
        conversation = Conversation.objects.filter(
            participants=sender_id
        ).filter(
            participants=receiver_id
        ).first()

        if not conversation:
            conversation = Conversation.objects.create()
            conversation.participants.add(sender_id, receiver_id)

        conversation.last_message = message
        conversation.save(update_fields=['last_message', 'updated_at'])

        return message

    @database_sync_to_async
    def set_online(self, user_id, is_online):
        try:
            User.objects.filter(id=user_id).update(online=is_online)
        except Exception:
            pass
