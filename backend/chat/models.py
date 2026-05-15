from django.db import models
from django.conf import settings


class Message(models.Model):
    """Chat message between two users."""

    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                related_name='messages_sent')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                  related_name='messages_received')
    text = models.TextField()
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender} → {self.receiver}: {self.text[:50]}"


class Conversation(models.Model):
    """Track conversations between two users for easy querying."""

    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')
    last_message = models.ForeignKey(Message, on_delete=models.SET_NULL, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        names = ', '.join(p.get_full_name() or p.username for p in self.participants.all())
        return f"Conversation: {names}"
