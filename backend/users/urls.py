from django.urls import path
from .views import SignupView, CustomLoginView, EngineerListCreateView, EngineerDetailView, EngineerCapacityView,UserView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Auth
    path("auth/signup/", SignupView.as_view(), name="signup"),
    path('auth/login/', CustomLoginView.as_view(), name='login'),
    path('auth/me/', UserView.as_view(), name='self_authenticate'),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Engineers
    path("engineers/", EngineerListCreateView.as_view(), name="engineer-list-create"),
    path("engineers/<uuid:pk>/", EngineerDetailView.as_view(), name="engineer-detail"),
    path("engineers/<uuid:id>/capacity/", EngineerCapacityView.as_view(), name="engineer-capacity")
]