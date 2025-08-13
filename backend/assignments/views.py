from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.shortcuts import get_object_or_404
from .models import Assignment
from .serializers import (
    AssignmentListSerializer,
    AssignmentDetailSerializer,
    AssignmentCreateUpdateSerializer,
)
from users.permissions import IsManager
from utils.pagination import DefaultPagination
from utils.exceptions import ERMSException


class AssignmentListCreateView(generics.ListCreateAPIView):
    pagination_class = DefaultPagination
    permission_classes = [IsManager]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AssignmentCreateUpdateSerializer
        return AssignmentListSerializer

    def get_queryset(self):
        queryset = Assignment.objects.select_related(
            "engineer", "project"
        ).order_by("-created_at")

        engineer_id = self.request.GET.get("engineer_id")
        project_id = self.request.GET.get("project_id")

        if engineer_id:
            queryset = queryset.filter(engineer_id=engineer_id)
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = AssignmentCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        engineer = serializer.validated_data["engineer"]
        new_allocation = serializer.validated_data["allocation_percentage"]
        start_date = serializer.validated_data["start_date"]
        end_date = serializer.validated_data.get("end_date")
        project = serializer.validated_data["project"]

        # Check if project is completed
        if project.status == "completed":
            raise ERMSException(
                status_code=400,
                detail="Cannot assign engineer to a completed project"
            )

        # Check for duplicate assignment
        overlap_exists = Assignment.objects.filter(
            engineer=engineer,
            project=project,
        ).exists()
        if overlap_exists:
            raise ERMSException(
                status_code=409,
                detail="Engineer is already assigned to this project"
            )

        # Capacity check
        active_allocations = Assignment.objects.filter(
            engineer=engineer,
            end_date__gte=start_date,
        )
        if end_date:
            active_allocations = active_allocations.filter(
                start_date__lte=end_date
            )

        total_allocated = active_allocations.aggregate(
            total=Sum("allocation_percentage")
        )["total"] or 0

        available = engineer.max_capacity - total_allocated

        if new_allocation > available:
            raise ERMSException(
                status_code=409,
                detail=f"Engineer is over capacity. Available: {available}%, Requested: {new_allocation}%"
            )

        # Create assignment
        assignment = serializer.save()

        return Response({
            "message": "Assignment created successfully",
            "assignment_id": assignment.id,
            "status": "SUCCESS"
        }, status=status.HTTP_201_CREATED)


class AssignmentDetailUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Assignment.objects.select_related("engineer", "project")
    http_method_names = ["get", "patch", "delete"]

    def get_permissions(self):
        if self.request.method in ["PATCH", "DELETE"]:
            return [IsManager()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return AssignmentCreateUpdateSerializer
        return AssignmentDetailSerializer

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = AssignmentCreateUpdateSerializer(
            instance,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)

        # Re-validate capacity on update
        new_allocation = serializer.validated_data.get(
            "allocation_percentage",
            instance.allocation_percentage
        )
        start_date = serializer.validated_data.get(
            "start_date",
            instance.start_date
        )
        end_date = serializer.validated_data.get(
            "end_date",
            instance.end_date
        )

        # Exclude current assignment from capacity check
        active_allocations = Assignment.objects.filter(
            engineer=instance.engineer,
            end_date__gte=start_date,
        ).exclude(id=instance.id)

        total_allocated = active_allocations.aggregate(
            total=Sum("allocation_percentage")
        )["total"] or 0

        available = instance.engineer.max_capacity - total_allocated

        if new_allocation > available:
            raise ERMSException(
                status_code=409,
                detail=f"Engineer is over capacity. Available: {available}%, Requested: {new_allocation}%"
            )

        assignment = serializer.save()
        return Response({
            "message": "Assignment updated successfully",
            "assignment_id": assignment.id
        }, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({
            "message": "Assignment removed successfully"
        }, status=status.HTTP_200_OK)