from rest_framework import serializers
from .models import Assignment
from users.models import User
from projects.models import Project


class AssignmentListSerializer(serializers.ModelSerializer):
    engineer = serializers.CharField(source="engineer.name", read_only=True)
    project = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id",
            "engineer",
            "project",
            "role",
            "allocation_percentage",
            "start_date",
            "end_date",
        ]


class AssignmentDetailSerializer(serializers.ModelSerializer):
    timeline = serializers.SerializerMethodField()
    engineer_id = serializers.UUIDField(source="engineer.id", read_only=True)
    project_id = serializers.UUIDField(source="project.id", read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id",
            "engineer_id",
            "project_id",
            "role",
            "allocation_percentage",
            "timeline",
        ]

    def get_timeline(self, obj):
        return {
            "start": obj.start_date,
            "end": obj.end_date,
        }


class AssignmentCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = [
            "engineer",
            "project",
            "role",
            "allocation_percentage",
            "start_date",
            "end_date",
        ]
        extra_kwargs = {
            "role": {"required": False},
            "end_date": {"required": False},
        }

    def validate(self, attrs):
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")
        allocation = attrs.get("allocation_percentage")

        # Validate dates
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError(
                {"end_date": "End date must be after start date"}
            )

        # Validate allocation range
        if allocation and (allocation < 1 or allocation > 100):
            raise serializers.ValidationError(
                {"allocation_percentage": "Allocation must be between 1 and 100"}
            )

        return attrs