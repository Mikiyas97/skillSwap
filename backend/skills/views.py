from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
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


# ─── AI Matching Views ──────────────────────────────────────

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def ai_match_view(request, post_id):
    """
    GET /api/skills/posts/<post_id>/ai-matches/
    Bidirectional: Wanted→Offer (find tutors) or Offer→Wanted (find learners)
    """
    from .ai_matching import get_ai_matches

    try:
        post = SkillListing.objects.select_related('tutor', 'category').get(pk=post_id)
    except SkillListing.DoesNotExist:
        return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    # Only the post owner can see their matches
    if post.tutor != request.user:
        return Response({"detail": "You can only view matches for your own posts."},
                        status=status.HTTP_403_FORBIDDEN)

    matches = get_ai_matches(post, exclude_user=request.user)

    results = []
    for match in matches:
        serialized = SkillListingSerializer(match["post"]).data
        results.append({
            "listing": serialized,
            "score": match["score"],
            "reason": match["reason"],
        })

    return Response(results)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def study_partner_view(request, post_id):
    """
    GET /api/skills/posts/<post_id>/study-partners/
    Bidirectional: Wanted→Wanted (peers to learn with) or Offer→Offer (co-tutors)
    """
    from .ai_matching import get_study_partners

    try:
        post = SkillListing.objects.select_related('tutor', 'category').get(pk=post_id)
    except SkillListing.DoesNotExist:
        return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    if post.tutor != request.user:
        return Response({"detail": "You can only view study partners for your own posts."},
                        status=status.HTTP_403_FORBIDDEN)

    partners = get_study_partners(post, exclude_user=request.user)

    results = []
    for partner in partners:
        serialized = SkillListingSerializer(partner["post"]).data
        results.append({
            "listing": serialized,
            "score": partner["score"],
            "reason": partner["reason"],
        })

    return Response(results)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def skill_suggestions_view(request):
    """GET /api/skills/profile/me/skill-suggestions/"""
    from .ai_matching import get_skill_suggestions

    suggestions = get_skill_suggestions(request.user)
    return Response(suggestions)
