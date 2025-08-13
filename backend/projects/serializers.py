from rest_framework import serializers
from .models import Project, ProjectSkill
from assignments.models import Skill
from users.models import User


class ProjectSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source="skill.name", read_only=True)

    class Meta:
        model = ProjectSkill
        fields = ["skill_name"]


class ProjectListSerializer(serializers.ModelSerializer):
    assigned_engineers = serializers.SerializerMethodField()
    status = serializers.CharField(source="get_status_display")

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "status",
            "start_date",
            "end_date",
            "team_size",
            "manager",
            "department",
            "assigned_engineers",
        ]

    def get_assigned_engineers(self, obj):
        return obj.assignments.count()


class ProjectDetailSerializer(serializers.ModelSerializer):
    engineers = serializers.SerializerMethodField()
    required_skills = serializers.SerializerMethodField()
    timeline = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "timeline",
            "status",
            "team_size",
            "manager",
            "department",
            "required_skills",
            "engineers",
        ]

    def get_timeline(self, obj):
        return {
            "start": obj.start_date,
            "end": obj.end_date,
        }

    def get_required_skills(self, obj):
        return [
            ps.skill.name
            for ps in obj.project_skills.select_related("skill")
        ]

    def get_engineers(self, obj):
        return [
            {
                "engineer_id": a.engineer.id,
                "name": a.engineer.name,
                "role": a.role,
                "allocation": a.allocation_percentage,
            }
            for a in obj.assignments.select_related("engineer")
        ]


class ProjectCreateUpdateSerializer(serializers.ModelSerializer):
    skills = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Project
        fields = [
            "name",
            "description",
            "start_date",
            "end_date",
            "team_size",
            "status",
            "manager",
            "department",
            "skills",
        ]
        extra_kwargs = {
            "name": {"required": True},
            "start_date": {"required": True},
            "description": {"required": False},
            "end_date": {"required": False},
            "team_size": {"required": False},
            "status": {"required": False},
            "manager": {"required": False},
            "department": {"required": False},
        }

    def validate(self, attrs):
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError(
                {"end_date": "End date must be after start date"}
            )
        return attrs

    def create(self, validated_data):
        skill_names = validated_data.pop("skills", [])
        project = Project.objects.create(**validated_data)

        if skill_names:
            skills = Skill.objects.filter(name__in=skill_names)
            ProjectSkill.objects.bulk_create([
                ProjectSkill(project=project, skill=skill)
                for skill in skills
            ])
        return project

    def update(self, instance, validated_data):
        skill_names = validated_data.pop("skills", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if skill_names is not None:
            ProjectSkill.objects.filter(project=instance).delete()
            skills = Skill.objects.filter(name__in=skill_names)
            ProjectSkill.objects.bulk_create([
                ProjectSkill(project=instance, skill=skill)
                for skill in skills
            ])
        return instance