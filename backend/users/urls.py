from django.urls import path
from .views import SignupView, CustomLoginView, EngineerListCreateView, EngineerDetailView, EngineerCapacityView,UserView,UserListView,UserUpdateDeleteView,EngineerAssignmentsView
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    # Auth
    path("auth/signup/", SignupView.as_view(), name="signup"),
    path('auth/login/', CustomLoginView.as_view(), name='login'),
    path('auth/me/', UserView.as_view(), name='self_authenticate'),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Engineers
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/<uuid:pk>/", UserUpdateDeleteView.as_view(), name="user-update-delete"),
    path("engineers/", EngineerListCreateView.as_view(), name="engineer-list-create"),
    path("engineers/<uuid:pk>/", EngineerDetailView.as_view(), name="engineer-detail"),
    path("engineers/<uuid:id>/capacity/", EngineerCapacityView.as_view(), name="engineer-capacity"),
    path("engineers/<uuid:id>/assignments/", EngineerAssignmentsView.as_view(), name="engineer-assignments"),
]