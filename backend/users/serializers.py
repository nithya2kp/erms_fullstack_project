from rest_framework import serializers 
from .models import User, Department, UserRoleChoices, UserSkill
from assignments.models import Skill
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils import timezone

today = timezone.now().date()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = [
            "password",
            "groups",
            "user_permissions",
            "is_superuser",
            "is_staff",
            "first_name",
            "last_name",
            "date_joined",
            "last_login",
        ]

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["name", "email", "password"]

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        return user
    
class CustomLoginSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        return {
            "message": "User successfully authenticated",
            "username": self.user.email,
            "access": data["access"],
        }
    
class EngineerBaseSerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "role",
            "seniority",
            "department",
            "max_capacity",
            "tech_role",
            "skills",
        ]

    def get_skills(self,obj):
        return[
            user_skill.skill.name
            for user_skill in obj.user_skills.select_related("skill")
        ]


class EngineerListSerializer(EngineerBaseSerializer):
    allocated = serializers.IntegerField(read_only=True)
    class Meta(EngineerBaseSerializer.Meta):
        fields = EngineerBaseSerializer.Meta.fields + ["allocated"]


class EngineerDetailSerializer(EngineerBaseSerializer):
    capacity = serializers.SerializerMethodField()
    active_projects = serializers.SerializerMethodField()
    class Meta(EngineerBaseSerializer.Meta):
        fields = EngineerBaseSerializer.Meta.fields + [
            "capacity",
            "active_projects"
        ]
    def get_capacity(self, obj):
        allocated = sum(
            a.allocation_percentage
            for a in obj.assignments.filter(end_date__isnull=True)
        )
        total = obj.max_capacity or 100

        return {
            "total": total,
            "allocated": allocated,
            "available": total - allocated
        }

    def get_active_projects(self, obj):
        assignments = obj.assignments.select_related("project").filter(end_date__isnull=False,end_date__gt=today)

        return [
            {
                "project_id": a.project.id,
                "project_name": a.project.name,
                "allocation_percent": a.allocation_percentage
            }
            for a in assignments
        ]
    

class EngineerCreateSerializer(EngineerBaseSerializer):
    email = serializers.EmailField()
    skills = serializers.ListField(
        child=serializers.CharField(),
        write_only=True
    )
    class Meta(EngineerBaseSerializer.Meta):
        fields = EngineerBaseSerializer.Meta.fields
        read_only_fields = ["id"]

    def validate_tech_role(self, value):
        allowed = ["frontend", "backend", "devops", "tester","fullstack"]
        if value not in allowed:
            raise serializers.ValidationError("Invalid tech role")
        return value
        
    def validate_skills(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Skills must be a list")

        db_skills = Skill.objects.filter(name__in=value)
        if len(db_skills) != len(value):
            raise serializers.ValidationError("Some skills are invalid")

        return value
        
    def validate_max_capacity(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Capacity must be between 0 and 100")
        return value
        
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User already exists with this email")
        return value
        
    def create(self, validated_data):
        skill_names = validated_data.pop("skills", [])
        print("DEBUG:", skill_names)

        user = User.objects.create(
            **validated_data,
            role=UserRoleChoices.ENGINEER
        )

        skills = Skill.objects.filter(name__in=skill_names)
        
        user_skills = [
            UserSkill(user=user, skill=skill)
            for skill in skills
        ]
        UserSkill.objects.bulk_create(user_skills)
        return user

        

   
