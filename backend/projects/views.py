from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Project
from .serializers import (
    ProjectListSerializer,
    ProjectDetailSerializer,
    ProjectCreateUpdateSerializer,
)
from users.permissions import IsManager
from utils.pagination import DefaultPagination


class ProjectListCreateView(generics.ListCreateAPIView):
    pagination_class = DefaultPagination

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsManager()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProjectCreateUpdateSerializer
        return ProjectListSerializer

    def get_queryset(self):
        queryset = Project.objects.all().order_by("-created_at")
        status_filter = self.request.GET.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = ProjectCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = serializer.save()
        return Response({
            "message": "Project created successfully",
            "project_id": project.id
        }, status=status.HTTP_201_CREATED)


class ProjectDetailUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    http_method_names = ["get", "patch", "delete"]

    def get_permissions(self):
        if self.request.method in ["PATCH", "DELETE"]:
            return [IsManager()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return ProjectCreateUpdateSerializer
        return ProjectDetailSerializer

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = ProjectCreateUpdateSerializer(
            instance,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        project = serializer.save()
        return Response({
            "message": "Project updated successfully",
            "project_id": project.id
        }, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({
            "message": "Project deleted successfully"
        }, status=status.HTTP_200_OK)