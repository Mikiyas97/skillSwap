from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Full user profile serializer."""
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'supabase_uid', 'email', 'name', 'first_name', 'last_name',
            'college', 'department', 'year', 'bio', 'avatar',
            'skills_teaching', 'skills_learning',
            'rating', 'total_reviews', 'sessions_completed',
            'badges', 'online', 'date_joined',
        ]
        read_only_fields = ['id', 'supabase_uid', 'email', 'rating', 'total_reviews',
                            'sessions_completed', 'badges', 'date_joined']

    def get_name(self, obj):
        return obj.get_full_name() or obj.username


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for profile updates."""
    name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['name', 'college', 'department', 'year', 'bio', 'avatar',
                  'skills_teaching', 'skills_learning']

    def update(self, instance, validated_data):
        name = validated_data.pop('name', None)
        if name:
            parts = name.split(' ', 1)
            instance.first_name = parts[0]
            instance.last_name = parts[1] if len(parts) > 1 else ''
        return super().update(instance, validated_data)


class LeaderboardSerializer(serializers.ModelSerializer):
    """Compact serializer for leaderboard display."""
    name = serializers.SerializerMethodField()
    score = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'college', 'department', 'avatar', 'rating',
                  'total_reviews', 'sessions_completed', 'badges', 'score']

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_score(self, obj):
        return int(obj.sessions_completed * 10 + obj.rating * 5)
