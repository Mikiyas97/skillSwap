from django.contrib import admin
from .models import Category, SkillListing


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(SkillListing)
class SkillListingAdmin(admin.ModelAdmin):
    list_display = ['title', 'tutor', 'level', 'category', 'is_active', 'created_at']
    list_filter = ['level', 'category', 'is_active']
    search_fields = ['title', 'description', 'tutor__email']
