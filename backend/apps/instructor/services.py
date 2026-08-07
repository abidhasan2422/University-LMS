from django.db import transaction
from django.shortcuts import get_object_or_404

from apps.common.query_service import QueryService

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