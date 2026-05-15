from rest_framework import serializers
from .models import Session, Review
from users.serializers import UserSerializer


class ReviewSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'student', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'student', 'created_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'comment']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5')
        return value


class SessionSerializer(serializers.ModelSerializer):
    tutor = UserSerializer(read_only=True)
    student = UserSerializer(read_only=True)
    review = ReviewSerializer(read_only=True)

    class Meta:
        model = Session
        fields = [
            'id', 'listing', 'tutor', 'student', 'skill_title',
            'date', 'time_slot', 'location', 'status', 'notes',
            'review', 'created_at', 'updated_at',
        ]


class SessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ['listing', 'date', 'time_slot', 'location', 'notes']

    def validate(self, data):
        listing = data['listing']
        user = self.context['request'].user

        if listing.tutor == user:
            raise serializers.ValidationError('You cannot book a session with yourself')

        # Check for duplicate booking
        exists = Session.objects.filter(
            tutor=listing.tutor,
            date=data['date'],
            time_slot=data['time_slot'],
            status__in=['pending', 'confirmed', 'upcoming'],
        ).exists()
        if exists:
            raise serializers.ValidationError('This time slot is already taken')

        return data

    def create(self, validated_data):
        listing = validated_data['listing']
        validated_data['tutor'] = listing.tutor
        validated_data['student'] = self.context['request'].user
        validated_data['skill_title'] = listing.title
        validated_data['status'] = 'upcoming'
        return super().create(validated_data)
