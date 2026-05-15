from django.db import models
from django.conf import settings


class Session(models.Model):
    """A tutoring session between a tutor and a student."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('upcoming', 'Upcoming'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    listing = models.ForeignKey('skills.SkillListing', on_delete=models.CASCADE,
                                 related_name='sessions')
    tutor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                               related_name='tutor_sessions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                 related_name='student_sessions')
    skill_title = models.CharField(max_length=200)
    date = models.DateField()
    time_slot = models.CharField(max_length=100)
    location = models.CharField(max_length=200, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        # Prevent double-booking the same slot
        constraints = [
            models.UniqueConstraint(
                fields=['tutor', 'date', 'time_slot'],
                condition=models.Q(status__in=['pending', 'confirmed', 'upcoming']),
                name='unique_tutor_timeslot',
            )
        ]

    def __str__(self):
        return f"{self.skill_title}: {self.tutor} → {self.student} ({self.date})"

    def complete(self):
        """Mark session as completed and update tutor stats."""
        self.status = 'completed'
        self.save(update_fields=['status'])
        self.tutor.sessions_completed += 1
        self.tutor.save(update_fields=['sessions_completed'])
        self.tutor.update_badges()


class Review(models.Model):
    """Review left by a student after a completed session."""

    session = models.OneToOneField(Session, on_delete=models.CASCADE, related_name='review')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                 related_name='reviews_given')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student} → {self.session.tutor}: {self.rating}★"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Recalculate tutor's average rating
        self.session.tutor.update_rating()
