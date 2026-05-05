from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from users.models import User, UserRoleChoices
from projects.models import Project
from users.permissions import IsManager
from django.utils.timezone import now
from django.db.models import Sum, Q
from django.conf import settings
from groq import Groq
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


def generate_recommendation(
    engineer_name,
    engineer_skills,
    required_skills,
    matched_skills,
    match_score,
    available_capacity
):
    """Generate human-friendly recommendation using Groq AI"""
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)

        prompt = f"""
You are an engineering resource manager assistant.
Generate a brief 1-2 sentence recommendation for assigning an engineer to a project.

Engineer: {engineer_name}
Engineer Skills: {', '.join(engineer_skills)}
Project Required Skills: {', '.join(required_skills)}
Matched Skills: {', '.join(matched_skills) if matched_skills else 'none'}
Match Score: {match_score}%
Available Capacity: {available_capacity}%

Write a concise, professional recommendation. Mention matched skills and capacity.
Do not use bullet points. Just 1-2 sentences.
        """

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=150,
            temperature=0.7,
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"Groq error: {e}")
        return f"{engineer_name} matches {match_score}% of required skills ({', '.join(matched_skills) if matched_skills else 'none'}) with {available_capacity}% capacity available."


class MatchEngineersView(APIView):
    permission_classes = [IsManager]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["project_id"],
            properties={
                "project_id": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="UUID of the project"
                )
            }
        )
    )
    def post(self, request):
        project_id = request.data.get("project_id")

        if not project_id:
            return Response(
                {"detail": "project_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get project
        try:
            project = Project.objects.prefetch_related(
                "project_skills__skill"
            ).get(id=project_id)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Project not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get required skills
        required_skills = [
            ps.skill.name.lower()
            for ps in project.project_skills.all()
        ]

        if not required_skills:
            return Response({
                "project_id": project_id,
                "project_name": project.name,
                "required_skills": [],
                "message": "No required skills set for this project",
                "matches": []
            })

        # Get all active engineers with capacity
        today = now().date()
        engineers = User.objects.filter(
            role=UserRoleChoices.ENGINEER,
            is_active=True
        ).prefetch_related("user_skills__skill").annotate(
            allocated=Sum(
                "assignments__allocation_percentage",
                filter=Q(
                    assignments__start_date__lte=today,
                    assignments__end_date__gte=today
                )
            )
        )

        # Match engineers
        matches = []

        for engineer in engineers:
            engineer_skills = [
                us.skill.name.lower()
                for us in engineer.user_skills.all()
            ]

            matched_skills = [
                skill for skill in required_skills
                if skill in engineer_skills
            ]

            match_score = round(
                (len(matched_skills) / len(required_skills)) * 100
            ) if required_skills else 0

            if match_score == 0:
                continue

            allocated = engineer.allocated or 0
            available = engineer.max_capacity - allocated

            if available <= 0:
                continue

            # Generate AI recommendation
            recommendation = generate_recommendation(
                engineer_name=engineer.name,
                engineer_skills=engineer_skills,
                required_skills=required_skills,
                matched_skills=matched_skills,
                match_score=match_score,
                available_capacity=available
            )

            matches.append({
                "engineer_id": engineer.id,
                "name": engineer.name,
                "email": engineer.email,
                "tech_role": engineer.tech_role,
                "seniority": engineer.seniority,
                "match_score": match_score,
                "matched_skills": matched_skills,
                "all_skills": engineer_skills,
                "required_skills": required_skills,
                "allocated": allocated,
                "available_capacity": available,
                "recommendation": recommendation,
                "explanation": f"Matched {len(matched_skills)} of {len(required_skills)} required skills"
            })

        # Sort by match score then available capacity
        matches = sorted(
            matches,
            key=lambda x: (x["match_score"], x["available_capacity"]),
            reverse=True
        )

        return Response({
            "project_id": project_id,
            "project_name": project.name,
            "required_skills": required_skills,
            "total_matches": len(matches),
            "matches": matches
        }, status=status.HTTP_200_OK)