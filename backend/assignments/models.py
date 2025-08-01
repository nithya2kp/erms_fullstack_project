from django.db import models
import uuid


class Assignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    engineer = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="assignments"
    )

    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="assignments"
    )

    allocation_percentage = models.IntegerField()

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

    role = models.CharField(max_length=50)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("engineer", "project")

    def __str__(self):
        return f"{self.engineer.name} -> {self.project.name}"
    


class Skill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name