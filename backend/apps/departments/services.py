from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Department
from apps.common.query_service import QueryService

class DepartmentService:
    """
    Service layer for Department business logic.
    """

    @staticmethod
    def create_department(serializer):
        """
        Create a new department.
        """
        return serializer.save()

@staticmethod
def get_all_departments(
    search=None,
    ordering=None,
    is_active=None,
):
    """
    Return departments with search, ordering, and filtering.
    """

    queryset = Department.objects.all()

    return QueryService.apply(
        queryset=queryset,
        search=search,
        search_fields=[
            "name",
            "code",
        ],
        ordering=ordering,
        allowed_ordering=[
            "name",
            "-name",
            "code",
            "-code",
            "created_at",
            "-created_at",
        ],
        filters={
            "is_active": is_active,
        },
    )

    @staticmethod
    def get_department_by_id(department_id):
        """
        Return a single department by ID.
        """
        return get_object_or_404(
          Department.objects.all(),
            id=department_id,
           
        )

    @staticmethod
    def update_department(serializer):
        """
        Update an existing department.
        """
        return serializer.save()

    @staticmethod
    def delete_department(department):
        """
        Soft delete a department.
        """
        department.soft_delete()
        return department


    @staticmethod
    def restore_department(department):
        """
        Restore a soft deleted department.
        """
        department.restore()
        return department

    @staticmethod
    def get_all_departments_for_admin():
        """
        Return all departments including soft deleted.
        """
        return Department.all_objects.all()


    @staticmethod
    def get_deleted_departments():
        """
        Return only soft deleted departments.
        """
        return Department.all_objects.filter(
            is_active=False
        )