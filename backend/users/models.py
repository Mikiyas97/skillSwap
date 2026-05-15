"""
Custom User model for SkillSwap DBU.
Linked to Supabase auth via supabase_uid.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended user model linked to Supabase Auth."""

    supabase_uid = models.CharField(max_length=255, unique=True, null=True, blank=True,
                                     help_text="Supabase Auth user ID (UUID)")
    college = models.CharField(max_length=100, blank=True, default='')
    department = models.CharField(max_length=100, blank=True, default='')
    year = models.CharField(max_length=20, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    avatar = models.URLField(blank=True, default='')
    skills_teaching = models.JSONField(default=list, blank=True)
    skills_learning = models.JSONField(default=list, blank=True)
    rating = models.FloatField(default=0.0)
    total_reviews = models.IntegerField(default=0)
    sessions_completed = models.IntegerField(default=0)
    badges = models.JSONField(default=list, blank=True)
    online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.email})"

    def update_rating(self):
        """Recalculate average rating from all reviews received."""
        from tutoring.models import Review
        reviews = Review.objects.filter(session__tutor=self)
        if reviews.exists():
            self.rating = round(reviews.aggregate(models.Avg('rating'))['rating__avg'], 1)
            self.total_reviews = reviews.count()
            self.save(update_fields=['rating', 'total_reviews'])

    def update_badges(self):
        """Auto-assign badges based on achievements."""
        new_badges = []
        if self.sessions_completed >= 50:
            new_badges.append('50+ Sessions')
        elif self.sessions_completed >= 10:
            new_badges.append('10+ Sessions')
        if self.rating >= 4.8 and self.total_reviews >= 5:
            new_badges.append('Top Tutor')
        if self.total_reviews >= 20:
            new_badges.append('Highly Rated')
        self.badges = list(set(new_badges))
        self.save(update_fields=['badges'])
