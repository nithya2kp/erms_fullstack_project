from django.urls import path
from .views import CapacityOverviewView, ManagerDashboardView

urlpatterns = [
    path("capacity/overview/", CapacityOverviewView.as_view(), name="capacity-overview"),
    path("dashboard/manager/", ManagerDashboardView.as_view(), name="manager-dashboard"),
]