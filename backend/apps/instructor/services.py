from django.db import models, transaction
from django.shortcuts import get_object_or_404

from apps.common.query_service import QueryService
from django.db.models import Count
from .models import Instructor


class EmployeeIDGenerator:
    """
    Generate Employee ID.

    Format:
        2026-15-0001
    """

    @staticmethod
    @transaction.atomic
    def generate(instructor):

        joining_year = str(instructor.joining_date.year)[2:]

        department_code = instructor.department.id_prefix

        latest_instructor = (
            Instructor.all_objects
            .select_for_update()
            .filter(
                department=instructor.department,
                joining_date__year=joining_year,
            )
            .order_by("-employee_id")
            .first()
        )

        if latest_instructor and latest_instructor.employee_id:

            last_serial = int(
                latest_instructor.employee_id.split("-")[-1]
            )

            next_serial = last_serial + 1

        else:

            next_serial = 1

        return (
            f"{joining_year}-"
            f"{department_code}-"
            f"{next_serial:04d}"
        )


class InstructorService:
    """
    Service layer for Instructor.
    """

    @staticmethod
    def create_instructor(serializer):

        instructor = serializer.save()

        instructor.employee_id = (
            EmployeeIDGenerator.generate(
                instructor
            )
        )

        instructor.save()

        return instructor

    @staticmethod
    def get_all_instructors(
        search=None,
        ordering=None,
        department=None,
        designation=None,
        employment_status=None,
    ):

        queryset = Instructor.objects.select_related(
            "user",
            "department",
        )

        return QueryService.apply(
            queryset=queryset,
            search=search,
            search_fields=[
                "employee_id",
                "user__first_name",
                "user__last_name",
                "user__email",
                "qualification",
                "specialization",
            ],
            ordering=ordering,
            allowed_ordering=[
                "employee_id",
                "-employee_id",
                "joining_date",
                "-joining_date",
                "experience_years",
                "-experience_years",
                "created_at",
                "-created_at",
            ],
            filters={
                "department_id": department,
                "designation": designation,
                "employment_status": employment_status,
            },
        )

    @staticmethod
    def get_instructor_by_id(instructor_id):

        return get_object_or_404(
            Instructor.objects.select_related(
                "user",
                "department",
            ),
            id=instructor_id,
        )

    @staticmethod
    def update_instructor(serializer):

        return serializer.save()

    @staticmethod
    def delete_instructor(instructor):

        instructor.soft_delete()

        return instructor

    @staticmethod
    def restore_instructor(instructor):

        instructor.restore()

        return instructor

    @staticmethod
    def get_deleted_instructors():

        return Instructor.all_objects.filter(
            is_active=False
        ).select_related(
            "user",
            "department",
        )
    @staticmethod
    def get_instructor_dashboard(user):
        """
        Return dashboard data for the logged-in instructor.
        """

        instructor = get_object_or_404(
            Instructor.objects.select_related(
                "user",
                "department",
            ),
            user=user,
            is_active=True,
        )

        course_offerings = (
            instructor.course_offerings
            .filter(is_active=True)
            .select_related(
                "course",
                "semester",
            )
            .annotate(
                student_count=Count(
                    "enrollments",
                    filter=models.Q(
                        enrollments__status="ENROLLED",
                        enrollments__is_active=True,
                    ),
                )
            )
        )

        total_courses = course_offerings.count()

        total_students = sum(
            offering.student_count
            for offering in course_offerings
        )

        active_courses = course_offerings.filter(
            status="OPEN"
        ).count()

        courses = []

        for offering in course_offerings:
            courses.append(
                {
                    "id": offering.id,
                    "course_code": offering.course.course_code,
                    "course_title": offering.course.course_title,
                    "semester": offering.semester.name,
                    "academic_year": offering.academic_year,
                    "section": offering.section,
                    "room": offering.room,
                    "day": offering.day,
                    "start_time": offering.start_time,
                    "end_time": offering.end_time,
                    "status": offering.status,
                    "student_count": offering.student_count,
                }
            )

        return {
            "instructor": {
                "id": instructor.id,
                "full_name": instructor.user.get_full_name(),
                "employee_id": instructor.employee_id,
                "email": instructor.user.email,
                "department": instructor.department.name,
                "designation": instructor.designation,
                "employment_status": instructor.employment_status,
            },
            "statistics": {
                "total_courses": total_courses,
                "total_students": total_students,
                "active_courses": active_courses,
            },
            "courses": courses,
        }