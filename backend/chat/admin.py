from django.contrib import admin
from .models import Message, Conversation


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'receiver', 'text', 'is_read', 'timestamp']
    list_filter = ['is_read', 'timestamp']
    search_fields = ['text', 'sender__email', 'receiver__email']


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'updated_at']
    filter_horizontal = ['participants']
