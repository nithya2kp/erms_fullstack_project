from django.urls import path
from .views import AssignmentListCreateView, AssignmentDetailUpdateDeleteView

urlpatterns = [
    path("", AssignmentListCreateView.as_view(), name="assignment-list-create"),
    path("<uuid:pk>/", AssignmentDetailUpdateDeleteView.as_view(), name="assignment-detail"),
]