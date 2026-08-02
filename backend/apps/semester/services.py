from django.shortcuts import get_object_or_404

from apps.common.query_service import QueryService

from .models import Semester


class SemesterService:
    """
    Service layer for Semester business logic.
    """

    @staticmethod
    def create_semester(serializer):
        """
        Create a new semester.
        """
        return serializer.save()

    @staticmethod
    def get_all_semesters(
        search=None,
        ordering=None,
    ):
        """
        Return all semesters with search and ordering.
        """

        queryset = Semester.objects.all()

        return QueryService.apply(
            queryset=queryset,
            search=search,
            search_fields=[
                "name",
                "year",
            ],
            ordering=ordering,
            allowed_ordering=[
                "name",
                "-name",
                "year",
                "-year",
                "created_at",
                "-created_at",
            ],
        )

    @staticmethod
    def get_semester_by_id(semester_id):
        """
        Return a single semester by ID.
        """
        return get_object_or_404(
            Semester.objects.all(),
            id=semester_id,
        )

    @staticmethod
    def update_semester(serializer):
        """
        Update an existing semester.
        """
        return serializer.save()

    @staticmethod
    def delete_semester(semester):
        """
        Soft delete a semester.
        """
        semester.soft_delete()
        return semester

    @staticmethod
    def restore_semester(semester):
        """
        Restore a soft deleted semester.
        """
        semester.restore()
        return semester

    @staticmethod
    def get_all_semesters_for_admin():
        """
        Return all semesters including soft deleted.
        """
        return Semester.all_objects.all()

    @staticmethod
    def get_deleted_semesters():
        """
        Return only soft deleted semesters.
        """
        return Semester.all_objects.filter(
            is_active=False
        )