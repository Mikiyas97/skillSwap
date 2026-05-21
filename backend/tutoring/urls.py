from django.urls import path
from . import views

urlpatterns = [
    path('', views.SessionListView.as_view(), name='session-list'),
    path('book/', views.SessionCreateView.as_view(), name='session-book'),
    path('<int:pk>/', views.SessionDetailView.as_view(), name='session-detail'),
    path('<int:pk>/complete/', views.complete_session, name='session-complete'),
    path('<int:pk>/cancel/', views.cancel_session, name='session-cancel'),
    path('<int:session_id>/review/', views.ReviewCreateView.as_view(), name='review-create'),
    path('reviews/tutor/<int:tutor_id>/', views.TutorReviewsView.as_view(), name='tutor-reviews'),
    path('reviews/listing/<int:listing_id>/', views.ListingReviewsView.as_view(), name='listing-reviews'),
]
