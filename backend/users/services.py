

# def get_allocated_capacity(user):
#     # later we connect assignments table
#     return 0

# def build_engineer_response(users):
#     result = []

#     for u in users:
#         result.append({
#             "id": u.id,
#             "name": u.name,
#             "email": u.email,
#             "role": u.role,
#             "seniority": u.seniority,
#             "department": u.department.id if u.department else None,
#             "max_capacity": u.max_capacity,
#             "allocated": get_allocated_capacity(u)
#         })

#     return result