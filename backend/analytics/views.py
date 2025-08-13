from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count, Avg
from users.models import User, UserRoleChoices
from projects.models import Project, ProjectStatusChoices
from assignments.models import Assignment
from users.permissions import IsManager
from django.utils.timezone import now


class CapacityOverviewView(APIView):
    permission_classes = [IsManager]

    def get(self, request):
        today = now().date()

        # All engineers
        engineers = User.objects.filter(role=UserRoleChoices.ENGINEER)
        total_engineers = engineers.count()

        # Active projects
        active_projects = Project.objects.filter(
            status=ProjectStatusChoices.ACTIVE
        ).count()

        # Overloaded engineers (>80% allocation)
        overloaded = []
        for engineer in engineers:
            active_allocations = Assignment.objects.filter(
                engineer=engineer,
                start_date__lte=today,
                end_date__gte=today
            )
            total_allocated = active_allocations.aggregate(
                total=Sum("allocation_percentage")
            )["total"] or 0

            if total_allocated > 80:
                overloaded.append({
                    "id": engineer.id,
                    "name": engineer.name,
                    "load": total_allocated
                })

        # Unassigned projects (no assignments)
        unassigned_projects = Project.objects.filter(
            assignments__isnull=True,
            status=ProjectStatusChoices.ACTIVE
        ).values("id", "name")

        # Filter by engineer or project if provided
        engineer_id = request.GET.get("engineer_id")
        project_id = request.GET.get("project_id")

        queryset = Assignment.objects.filter(
            start_date__lte=today,
            end_date__gte=today
        )
        if engineer_id:
            queryset = queryset.filter(engineer_id=engineer_id)
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        return Response({
            "total_engineers": total_engineers,
            "active_projects": active_projects,
            "overloaded_engineers": overloaded,
            "unassigned_projects": list(unassigned_projects)
        }, status=status.HTTP_200_OK)


class ManagerDashboardView(APIView):
    permission_classes = [IsManager]

    def get(self, request):
        today = now().date()

        engineers = User.objects.filter(role=UserRoleChoices.ENGINEER)
        total_engineers = engineers.count()

        active_projects = Project.objects.filter(
            status=ProjectStatusChoices.ACTIVE
        ).count()

        # Calculate average utilization
        total_utilization = 0
        overloaded_count = 0

        for engineer in engineers:
            active_allocations = Assignment.objects.filter(
                engineer=engineer,
                start_date__lte=today,
                end_date__gte=today
            ).aggregate(
                total=Sum("allocation_percentage")
            )["total"] or 0

            utilization = (
                (active_allocations / engineer.max_capacity) * 100
                if engineer.max_capacity > 0 else 0
            )
            total_utilization += utilization

            if utilization > 80:
                overloaded_count += 1

        avg_utilization = round(
            total_utilization / total_engineers
            if total_engineers > 0 else 0
        )

        # Unassigned projects
        unassigned_projects = Project.objects.filter(
            assignments__isnull=True,
            status=ProjectStatusChoices.ACTIVE
        ).count()

        # Top projects by allocation
        top_projects = []
        active_project_list = Project.objects.filter(
            status=ProjectStatusChoices.ACTIVE
        ).prefetch_related("assignments")

        for project in active_project_list:
            total_allocation = project.assignments.aggregate(
                total=Sum("allocation_percentage")
            )["total"] or 0
            top_projects.append({
                "project_id": project.id,
                "name": project.name,
                "allocation": total_allocation
            })

        # Sort by allocation descending
        top_projects = sorted(
            top_projects,
            key=lambda x: x["allocation"],
            reverse=True
        )[:5]

        return Response({
            "summary": {
                "total_engineers": total_engineers,
                "active_projects": active_projects,
                "utilization_avg": avg_utilization,
            },
            "alerts": {
                "overloaded_engineers": overloaded_count,
                "unassigned_projects": unassigned_projects,
            },
            "top_projects": top_projects
        }, status=status.HTTP_200_OK)