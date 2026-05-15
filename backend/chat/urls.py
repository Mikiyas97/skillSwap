from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('messages/<int:user_id>/', views.MessageListView.as_view(), name='message-list'),
    path('messages/send/', views.MessageCreateView.as_view(), name='message-send'),
    path('messages/<int:user_id>/read/', views.mark_messages_read, name='messages-read'),
]
