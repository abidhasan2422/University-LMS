from django.shortcuts import get_object_or_404

from .models import Department


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
    def get_all_departments():
        """
        Return all departments.
        """
        return Department.objects.all()

    @staticmethod
    def get_department_by_id(department_id):
        """
        Return a single department by ID.
        """
        return get_object_or_404(
            Department,
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
        Delete a department.
        """
        department.delete()