# app/permissions.py

from rest_framework.permissions import BasePermission
from .models import UserRoleChoices, User


class IsManager(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == UserRoleChoices.MANAGER
        )
    
    # def get_queryset(self):
    #     user = self.request.user

    #     if user.role == "manager":
    #         return User.objects.filter(role="engineer")

    #     return User.objects.filter(id=user.id)
    
