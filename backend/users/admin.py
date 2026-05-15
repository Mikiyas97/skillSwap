from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'first_name', 'last_name', 'department', 'year',
                    'rating', 'sessions_completed', 'online', 'date_joined']
    list_filter = ['department', 'year', 'online']
    search_fields = ['email', 'first_name', 'last_name', 'username']
    readonly_fields = ['supabase_uid', 'rating', 'total_reviews', 'sessions_completed']
