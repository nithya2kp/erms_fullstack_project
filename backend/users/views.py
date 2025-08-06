from django.shortcuts import render
from rest_framework import generics
from .models import User,UserRoleChoices
from.permissions import IsManager
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, ListCreateAPIView
from .serializers import SignupSerializer,CustomLoginSerializer, EngineerListSerializer, EngineerDetailSerializer, EngineerCreateSerializer, UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from utils.pagination import DefaultPagination
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils.timezone import now


class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignupSerializer

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomLoginSerializer

class EngineerListCreateView(ListCreateAPIView):
    permission_classes = [IsManager]
    pagination_class = DefaultPagination

    def get_serializer_class(self):
        if self.request.method == "POST":
            return EngineerCreateSerializer
        return EngineerListSerializer

    def get_queryset(self):
        seniority = self.request.GET.get("seniority")
        department = self.request.GET.get("department")

        queryset = User.objects.filter(role=UserRoleChoices.ENGINEER).order_by("created_at").prefetch_related("user_skills__skill")
        if seniority:
            queryset = queryset.filter(seniority=seniority)

        if department:
            queryset = queryset.filter(department_id=department)

        return  queryset
    
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

class UserView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

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