from rest_framework import serializers
from .models import SkillListing, Category
from users.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon']


class SkillListingSerializer(serializers.ModelSerializer):
    """Read serializer with nested tutor info."""
    tutor = UserSerializer(read_only=True)
    rating = serializers.FloatField(read_only=True)
    total_reviews = serializers.IntegerField(read_only=True, source='tutor.total_reviews')
    sessions_completed = serializers.IntegerField(read_only=True, source='tutor.sessions_completed')
    category_name = serializers.CharField(source='category.name', read_only=True, default='')

    class Meta:
        model = SkillListing
        fields = [
            'id', 'tutor', 'title', 'description', 'category', 'category_name',
            'tags', 'level', 'availability', 'is_active',
            'rating', 'total_reviews', 'sessions_completed',
            'created_at', 'updated_at',
        ]


class SkillListingCreateSerializer(serializers.ModelSerializer):
    """Write serializer — tutor is set automatically from request."""

    class Meta:
        model = SkillListing
        fields = ['title', 'description', 'category', 'tags', 'level', 'availability']

    def create(self, validated_data):
        validated_data['tutor'] = self.context['request'].user
        return super().create(validated_data)
