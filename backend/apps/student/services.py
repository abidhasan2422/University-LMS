from django.db import transaction
from django.db.models import Max
from django.shortcuts import get_object_or_404

from apps.common.query_service import QueryService

from .models import Student


class StudentIDGenerator:
    """
    Generate unique student IDs.
    Format:
        221-15-0001
        221-15-0002
    """

    @staticmethod
    @transaction.atomic
    def generate(student):
        """
        Generate the next available student ID.
        """

        batch = f"{str(student.admission_year)[2:]}1"

        department_code = student.department.code

        latest_student = (
            Student.all_objects.select_for_update()
            .filter(
                admission_year=student.admission_year,
                department=student.department,
                admission_status=Student.AdmissionStatus.APPROVED,
            )
            .order_by("-student_id")
            .first()
        )

        if latest_student and latest_student.student_id:

            last_serial = int(
                latest_student.student_id.split("-")[-1]
            )

            next_serial = last_serial + 1

        else:

            next_serial = 1

        student_id = (
            f"{batch}-{department_code}-{next_serial:04d}"
        )

        return student_id

class StudentService:
    """
    Service layer for Student business logic.
    """
    @staticmethod
    def register_student(serializer):
        """
        Register a student.

        Student ID is NOT generated here.
        Status remains PENDING.
        """

        return serializer.save(
            admission_status=Student.AdmissionStatus.PENDING
        )
    @staticmethod
    def get_all_students(
        search=None,
        ordering=None,
        department=None,
        semester=None,
        admission_status=None,
    ):

        queryset = Student.objects.select_related(
            "user",
            "department",
            "semester",
        )

        return QueryService.apply(
            queryset=queryset,
            search=search,
            search_fields=[
                "student_id",
                "user__first_name",
                "user__last_name",
                "user__email",
                "user__mobile",
            ],
            ordering=ordering,
            allowed_ordering=[
                "student_id",
                "-student_id",
                "admission_year",
                "-admission_year",
                "created_at",
                "-created_at",
            ],
            filters={
                "department_id": department,
                "semester_id": semester,
                "admission_status": admission_status,
            },
        )
    @staticmethod
    def get_student_by_id(student_id):

        return get_object_or_404(
            Student.objects.select_related(
                "user",
                "department",
                "semester",
            ),
            id=student_id,
        )
    @staticmethod
    def get_pending_students():
        """
        Return all pending student applications.
        """

        return Student.objects.select_related(
            "user",
            "department",
            "semester",
        ).filter(
            admission_status=Student.AdmissionStatus.PENDING
        )
    @staticmethod
    def get_approved_students():
        """
        Return all approved students.
        """

        return Student.objects.select_related(
            "user",
            "department",
            "semester",
        ).filter(
            admission_status=Student.AdmissionStatus.APPROVED
        )
    @staticmethod
    @transaction.atomic
    def approve_student(student, student_id=None):
        """
        Approve a student.
        """

        if student.admission_status == Student.AdmissionStatus.APPROVED:
            raise ValueError(
                "Student has already been approved."
            )

        # Generate suggested ID
        if not student_id:
            student_id = StudentIDGenerator.generate(student)

        # Ensure uniqueness
        if Student.all_objects.filter(
            student_id=student_id
        ).exists():
            raise ValueError(
                "Student ID already exists."
            )

        student.student_id = student_id
        student.admission_status = (
            Student.AdmissionStatus.APPROVED
        )

        student.save()

        return student

    @staticmethod
    def reject_student(student):
        """
        Reject a student application.
        """

        student.admission_status = (
            Student.AdmissionStatus.REJECTED
        )

        student.save()

        return student
    @staticmethod
    def update_student(serializer):
        """
        Update student information.
        """

        return serializer.save()
    @staticmethod
    def delete_student(student):
        """
        Soft delete a student.
        """

        student.soft_delete()

        return student
    @staticmethod
    def restore_student(student):
        """
        Restore a soft deleted student.
        """

        student.restore()

        return student
    @staticmethod
    def get_all_students_for_admin():
        """
        Return all students including soft deleted.
        """

        return Student.all_objects.select_related(
            "user",
            "department",
            "semester",
        )
    @staticmethod
    def get_deleted_students():
        """
        Return only soft deleted students.
        """

        return Student.all_objects.filter(
            is_active=False
        ).select_related(
            "user",
            "department",
            "semester",
        )