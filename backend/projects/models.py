from django.db import models
import uuid

class ProjectStatusChoices(models.TextChoices):
    PLANNING = "planning", "Planning"
    ACTIVE = "active", "Active"
    COMPLETED = "completed", "Completed"


class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=200)
    description = models.TextField()

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

    team_size = models.IntegerField()

    status = models.CharField(
        max_length=20,
        choices=ProjectStatusChoices.choices,
        default=ProjectStatusChoices.PLANNING
    )

    manager = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="managed_projects"
    )

    department = models.ForeignKey(
        "users.Department",
        on_delete=models.SET_NULL,
        null=True,
        related_name="projects"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.name
    

class ProjectSkill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="project_skills"
    )

    skill = models.ForeignKey(
        "assignments.Skill",
        on_delete=models.CASCADE,
        related_name="skill_projects"
    )

    class Meta:
        unique_together = ("project", "skill")

    def __str__(self):
        return f"{self.project.name} - {self.skill.name}"
