from django.core.management.base import BaseCommand
from users.models import User, UserRoleChoices, UserSkill, Department
from projects.models import Project, ProjectSkill, ProjectStatusChoices
from assignments.models import Assignment, Skill
from datetime import date


class Command(BaseCommand):
    help = 'Seed database with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')

        # Clear existing data
        Assignment.objects.all().delete()
        ProjectSkill.objects.all().delete()
        UserSkill.objects.all().delete()
        Project.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        Skill.objects.all().delete()
        Department.objects.all().delete()

        # Create Skills
        skill_names = [
            'Python', 'Django', 'React', 'PostgreSQL',
            'Docker', 'AWS', 'Node.js', 'TypeScript',
            'FastAPI', 'Redis'
        ]
        skills = {}
        for name in skill_names:
            skill = Skill.objects.create(name=name)
            skills[name] = skill
        self.stdout.write('✅ Skills created')

        # Create Departments
        dept_names = ['Backend', 'Frontend', 'DevOps', 'Fullstack']
        depts = {}
        for name in dept_names:
            dept = Department.objects.create(name=name)
            depts[name] = dept
        self.stdout.write('✅ Departments created')

        # Create Managers
        managers_data = [
            {
                'name': 'Sharon',
                'email': 'sharon@erms.com',
                'password': 'Manager@1234',
                'role': UserRoleChoices.MANAGER,
                'seniority': 'senior',
                'tech_role': 'backend',
                'department': depts['Backend'],
                'max_capacity': 100,
            },
            {
                'name': 'Arjun',
                'email': 'arjun@erms.com',
                'password': 'Manager@1234',
                'role': UserRoleChoices.MANAGER,
                'seniority': 'senior',
                'tech_role': 'frontend',
                'department': depts['Frontend'],
                'max_capacity': 100,
            },
            {
                'name': 'Sruti',
                'email': 'sruti@erms.com',
                'password': 'Manager@1234',
                'role': UserRoleChoices.MANAGER,
                'seniority': 'senior',
                'tech_role': 'fullstack',
                'department': depts['Fullstack'],
                'max_capacity': 100,
            },
        ]
        managers = []
        for data in managers_data:
            password = data.pop('password')
            user = User(**data)
            user.set_password(password)
            user.save()
            managers.append(user)
        self.stdout.write('✅ Managers created')

        # Create Engineers
        engineers_data = [
            {
                'name': 'Vimal',
                'email': 'vimal@erms.com',
                'password': 'Engineer@1234',
                'role': UserRoleChoices.ENGINEER,
                'seniority': 'senior',
                'tech_role': 'backend',
                'department': depts['Backend'],
                'max_capacity': 100,
                'skills': ['Python', 'Django', 'PostgreSQL', 'Redis'],
            },
            {
                'name': 'Sarah',
                'email': 'sarah@erms.com',
                'password': 'Engineer@1234',
                'role': UserRoleChoices.ENGINEER,
                'seniority': 'mid',
                'tech_role': 'frontend',
                'department': depts['Frontend'],
                'max_capacity': 100,
                'skills': ['React', 'TypeScript', 'Node.js'],
            },
            {
                'name': 'Antony',
                'email': 'antony@erms.com',
                'password': 'Engineer@1234',
                'role': UserRoleChoices.ENGINEER,
                'seniority': 'senior',
                'tech_role': 'devops',
                'department': depts['DevOps'],
                'max_capacity': 100,
                'skills': ['Docker', 'AWS', 'Python'],
            },
            {
                'name': 'Emma',
                'email': 'emma@erms.com',
                'password': 'Engineer@1234',
                'role': UserRoleChoices.ENGINEER,
                'seniority': 'junior',
                'tech_role': 'backend',
                'department': depts['Backend'],
                'max_capacity': 100,
                'skills': ['Python', 'Django', 'PostgreSQL'],
            },
            {
                'name': 'David',
                'email': 'david@erms.com',
                'password': 'Engineer@1234',
                'role': UserRoleChoices.ENGINEER,
                'seniority': 'mid',
                'tech_role': 'fullstack',
                'department': depts['Fullstack'],
                'max_capacity': 100,
                'skills': ['React', 'Node.js', 'Python', 'Docker'],
            },
        ]
        engineers = []
        for data in engineers_data:
            password = data.pop('password')
            eng_skills = data.pop('skills')
            user = User(**data)
            user.set_password(password)
            user.save()
            # Add skills
            for skill_name in eng_skills:
                UserSkill.objects.create(
                    user=user,
                    skill=skills[skill_name]
                )
            engineers.append(user)
        self.stdout.write('✅ Engineers created')

        # Create Projects
        projects_data = [
            {
                'name': 'ERMS Backend API',
                'description': 'Core API development for resource management system',
                'start_date': date(2025, 8, 1),
                'end_date': date(2025, 12, 31),
                'team_size': 3,
                'status': ProjectStatusChoices.ACTIVE,
                'manager': managers[0],
                'skills': ['Python', 'Django', 'PostgreSQL', 'Redis'],
            },
            {
                'name': 'React Dashboard',
                'description': 'Frontend dashboard for analytics and reporting',
                'start_date': date(2025, 9, 1),
                'end_date': date(2026, 2, 28),
                'team_size': 2,
                'status': ProjectStatusChoices.ACTIVE,
                'manager': managers[1],
                'skills': ['React', 'TypeScript', 'Node.js'],
            },
            {
                'name': 'Cloud Migration',
                'description': 'AWS cloud migration and infrastructure setup',
                'start_date': date(2025, 7, 1),
                'end_date': date(2025, 11, 30),
                'team_size': 2,
                'status': ProjectStatusChoices.ACTIVE,
                'manager': managers[2],
                'skills': ['Docker', 'AWS', 'Python'],
            },
            {
                'name': 'Mobile App MVP',
                'description': 'Cross-platform mobile application development',
                'start_date': date(2025, 10, 1),
                'end_date': date(2026, 3, 31),
                'team_size': 3,
                'status': ProjectStatusChoices.PLANNING,
                'manager': managers[0],
                'skills': ['React', 'Node.js', 'Python'],
            },
        ]
        projects = []
        for data in projects_data:
            proj_skills = data.pop('skills')
            project = Project.objects.create(**data)
            # Add skills
            for skill_name in proj_skills:
                ProjectSkill.objects.create(
                    project=project,
                    skill=skills[skill_name]
                )
            projects.append(project)
        self.stdout.write('✅ Projects created')

        # Create Assignments
        assignments_data = [
            {
                'engineer': engineers[0],  
                'project': projects[0],    
                'role': 'Tech Lead',
                'allocation_percentage': 60,
                'start_date': date(2025, 8, 1),
                'end_date': date(2025, 12, 31),
            },
            {
                'engineer': engineers[3],  
                'project': projects[0],    
                'role': 'Backend Developer',
                'allocation_percentage': 40,
                'start_date': date(2025, 8, 1),
                'end_date': date(2025, 12, 31),
            },
            {
                'engineer': engineers[1],  
                'project': projects[1],    
                'role': 'Frontend Lead',
                'allocation_percentage': 70,
                'start_date': date(2025, 9, 1),
                'end_date': date(2026, 2, 28),
            },
            {
                'engineer': engineers[4],  
                'project': projects[1],    
                'role': 'Fullstack Developer',
                'allocation_percentage': 50,
                'start_date': date(2025, 9, 1),
                'end_date': date(2026, 2, 28),
            },
            {
                'engineer': engineers[2],  
                'project': projects[2],    
                'role': 'DevOps Lead',
                'allocation_percentage': 80,
                'start_date': date(2025, 7, 1),
                'end_date': date(2025, 11, 30),
            },
            {
                'engineer': engineers[0],  
                'project': projects[2],    
                'role': 'Backend Support',
                'allocation_percentage': 30,
                'start_date': date(2025, 7, 1),
                'end_date': date(2025, 11, 30),
            },
        ]
        for data in assignments_data:
            Assignment.objects.create(**data)
        self.stdout.write('✅ Assignments created')

        self.stdout.write(self.style.SUCCESS('''
✅ Database seeded successfully!
        '''))