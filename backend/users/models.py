from django.contrib.auth.models import AbstractUser,BaseUserManager
from django.db import models
import uuid


class UserRoleChoices(models.TextChoices):
    ENGINEER = "engineer", "Engineer"
    MANAGER = "manager", "Manager"

class TechRoleChoices(models.TextChoices):
    FRONTEND = "frontend", "Frontend"
    BACKEND = "backend", "Backend"
    DEVOPS = "devops", "Devops"
    TESTER = "tester", "Tester"
    FULLSTACK = "fullstack", "Fullstack"

class SeniorityChoices(models.TextChoices):
    JUNIOR = "junior", "Junior"
    MID = "mid", "Mid"
    SENIOR = "senior", "Senior"


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, password, **extra_fields)

class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    username = None
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)

    role = models.CharField(max_length=20, choices=UserRoleChoices.choices,default=UserRoleChoices.ENGINEER)
    tech_role = models.CharField(max_length=20, choices=TechRoleChoices.choices, null=True,blank=True)
    seniority = models.CharField(max_length=20, choices=SeniorityChoices.choices)

    max_capacity = models.IntegerField(default=100)

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    
    objects = UserManager()

    def __str__(self):
        return self.name
    

class UserSkill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="user_skills"
    )

    skill = models.ForeignKey(
        "assignments.Skill",
        on_delete=models.CASCADE,
        related_name="skill_users"
    )
    class Meta:
        unique_together = ("user", "skill")

    def __str__(self):
        return f"{self.user.name} - {self.skill.name}"