from django.shortcuts import render
from rest_framework import generics
from .models import User,UserRoleChoices
from.permissions import IsManager
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, ListCreateAPIView,ListAPIView,RetrieveUpdateDestroyAPIView
from .serializers import SignupSerializer,CustomLoginSerializer, EngineerListSerializer, EngineerDetailSerializer, EngineerCreateSerializer, UserSerializer,UserUpdateSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from utils.pagination import DefaultPagination
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from assignments.models import Skill
from users.models import UserSkill
from utils.exceptions import ERMSException
from assignments.models import Assignment
from assignments.serializers import AssignmentListSerializer
from django.db.models import Sum, Q
from django.utils.timezone import now

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignupSerializer
    permission_classes = [AllowAny]

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomLoginSerializer
    permission_classes = [AllowAny]

class UserListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = DefaultPagination
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return User.objects.all().order_by("created_at")

        elif user.role == UserRoleChoices.MANAGER:
            return User.objects.filter(
                role=UserRoleChoices.ENGINEER
            ).order_by("created_at").prefetch_related("user_skills__skill")

        else:
            raise PermissionDenied("You do not have permission to view this list.")
        
class EngineerListCreateView(ListCreateAPIView):
    permission_classes = [IsManager]
    pagination_class = DefaultPagination

    def get_serializer_class(self):
        if self.request.method == "POST":
            return EngineerCreateSerializer
        return EngineerListSerializer

    def get_queryset(self):
        today = now().date()
        seniority = self.request.GET.get("seniority")
        department = self.request.GET.get("department")

        queryset = User.objects.filter(
            role=UserRoleChoices.ENGINEER
        ).order_by("created_at").prefetch_related(
            "user_skills__skill"
        ).annotate(
            allocated=Sum(
                "assignments__allocation_percentage",
                filter=Q(
                    assignments__start_date__lte=today,
                    assignments__end_date__gte=today
                )
            )
        )

        if seniority:
            queryset = queryset.filter(seniority=seniority)
        if department:
            queryset = queryset.filter(department_id=department)

        return queryset
    
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        return Response({
            "message": "Engineer created successfully",
            "engineer_id": response.data["id"]
        }, status=status.HTTP_201_CREATED)
        

class EngineerDetailView(RetrieveAPIView):
    permission_classes = [IsManager]
    serializer_class = EngineerDetailSerializer
    queryset = User.objects.filter(role="engineer")

    # def get_queryset(self):
    #     return User.objects.filter(role=UserRoleChoices.ENGINEER)

class EngineerAssignmentsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AssignmentListSerializer
    pagination_class = DefaultPagination

    def get_queryset(self):
        user = self.request.user
        engineer_id = self.kwargs.get("id")

        # Access control
        if (
            user.role != UserRoleChoices.MANAGER
            and str(user.id) != str(engineer_id)
        ):
            raise ERMSException(
                status_code=403,
                detail="You can only view your own assignments"
            )

        return Assignment.objects.filter(
            engineer_id=engineer_id
        ).select_related("project").order_by("-created_at")
    
class UserView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class UserUpdateDeleteView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsManager]
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer
    http_method_names = ["patch", "delete"]

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        skill_names = request.data.get("skills", None)

        serializer = UserUpdateSerializer(
            instance,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        if skill_names is not None:
            UserSkill.objects.filter(user=user).delete()
            skills = Skill.objects.filter(name__in=skill_names)
            UserSkill.objects.bulk_create([
                UserSkill(user=user, skill=skill)
                for skill in skills
            ])

        return Response({
            "message": "User updated successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Deleted successfully"}, status=status.HTTP_200_OK)
    
class EngineerCapacityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        engineer = get_object_or_404(
            User,
            id=id,
            role=UserRoleChoices.ENGINEER
        )

        #  Access control (Manager OR Self)
        if (
            request.user.role != UserRoleChoices.MANAGER and
            request.user.id != engineer.id
        ):
            return Response({"detail": "Unauthorized"}, status=403)

        total_capacity = engineer.max_capacity

        #Active assignments only
        today = now().date()

        assignments = engineer.assignments.filter(
            start_date__lte=today,
            end_date__gte=today
        )

        #Calculate allocation
        allocated = sum(a.allocation_percentage for a in assignments)

        available = total_capacity - allocated

        utilization = (
            int((allocated / total_capacity) * 100)
            if total_capacity > 0 else 0
        )

        #  Status logic
        if utilization < 70:
            status = "SAFE"
        elif utilization < 90:
            status = "WARNING"
        else:
            status = "OVERLOADED"

        return Response({
            "engineer_id": engineer.id,
            "capacity": total_capacity,
            "allocated": allocated,
            "available": available,
            "utilization_percent": utilization,
            "status": status
        })