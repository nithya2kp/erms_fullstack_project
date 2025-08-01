from django.urls import path
from .views import SignupView, CustomLoginView, EngineerListCreateView, EngineerDetailView, EngineerCapacityView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path('login/', CustomLoginView.as_view(), name='login'),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("engineers/", EngineerListCreateView.as_view(), name="engineer-list-create"),
    path("engineers/<uuid:pk>/", EngineerDetailView.as_view(), name="engineer-detail"),
    path("engineers/<uuid:id>/capacity/", EngineerCapacityView.as_view(), name="engineer-capacity")
]