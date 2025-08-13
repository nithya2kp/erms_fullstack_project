from django.urls import path
from .views import ProjectListCreateView, ProjectDetailUpdateDeleteView

urlpatterns = [
    path("", ProjectListCreateView.as_view(), name="project-list-create"),
    path("<uuid:pk>/", ProjectDetailUpdateDeleteView.as_view(), name="project-detail"),
]