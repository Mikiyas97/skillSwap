from django.urls import path
from . import views

urlpatterns = [
    path('listings/', views.SkillListingListView.as_view(), name='skill-list'),
    path('listings/<int:pk>/', views.SkillListingDetailView.as_view(), name='skill-detail'),
    path('listings/create/', views.SkillListingCreateView.as_view(), name='skill-create'),
    path('listings/<int:pk>/update/', views.SkillListingUpdateView.as_view(), name='skill-update'),
    path('listings/<int:pk>/delete/', views.SkillListingDeleteView.as_view(), name='skill-delete'),
    path('my-listings/', views.MyListingsView.as_view(), name='my-listings'),
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
]
