from django.contrib import admin
from .models import Session, Review
# Register your models here.    

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['skill_title', 'tutor', 'student', 'date', 'time_slot', 'status', 'created_at']
    list_filter = ['status', 'date']
    search_fields = ['skill_title', 'tutor__email', 'student__email']
#admin.site.register(Session, SessionAdmin)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['student', 'session', 'rating', 'created_at']
    list_filter = ['rating']
    search_fields = ['comment', 'student__email']
