from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import SkillListing, Category
from .serializers import (
    SkillListingSerializer,
    SkillListingCreateSerializer,
    CategorySerializer,
)


class SkillListingListView(generics.ListAPIView):
    """Browse all active skill listings. Public endpoint."""
    serializer_class = SkillListingSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['level', 'category', 'tutor']
    search_fields = ['title', 'description', 'tags', 'tutor__first_name', 'tutor__last_name']
    ordering_fields = ['created_at', 'tutor__rating']
    ordering = ['-created_at']

    def get_queryset(self):
        return SkillListing.objects.filter(is_active=True).select_related('tutor', 'category')


class SkillListingDetailView(generics.RetrieveAPIView):
    """Get a single skill listing detail. Public endpoint."""
    serializer_class = SkillListingSerializer
    permission_classes = [permissions.AllowAny]
    queryset = SkillListing.objects.select_related('tutor', 'category')


class SkillListingCreateView(generics.CreateAPIView):
    """Create a new skill listing. Requires auth."""
    serializer_class = SkillListingCreateSerializer


class MyListingsView(generics.ListAPIView):
    """Get the current user's skill listings."""
    serializer_class = SkillListingSerializer

    def get_queryset(self):
        return SkillListing.objects.filter(tutor=self.request.user).select_related('category')


class SkillListingUpdateView(generics.UpdateAPIView):
    """Update a skill listing. Only the tutor can update."""
    serializer_class = SkillListingCreateSerializer

    def get_queryset(self):
        return SkillListing.objects.filter(tutor=self.request.user)


class SkillListingDeleteView(generics.DestroyAPIView):
    """Delete a skill listing. Only the tutor can delete."""

    def get_queryset(self):
        return SkillListing.objects.filter(tutor=self.request.user)


class CategoryListView(generics.ListAPIView):
    """List all skill categories. Public."""
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    queryset = Category.objects.all()
