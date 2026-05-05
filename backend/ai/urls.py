from django.urls import path
from .views import MatchEngineersView

urlpatterns = [
    path("match-engineers/", MatchEngineersView.as_view(), name="match-engineers"),
]