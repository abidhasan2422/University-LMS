from django.shortcuts import get_object_or_404
from django.db.models import Q
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
    def get_all_departments(search=None, ordering=None,  is_active=True):
        """
        Return all departments with optional search.
        """

        queryset = Department.objects.filter( is_active=is_active)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(code__icontains=search)
            )
        allowed_ordering = [
            "name",
            "-name",
            "code",
            "-code",
            "created_at",
            "-created_at",
        ]
        if ordering in allowed_ordering:
            queryset = queryset.order_by(ordering)


        return queryset

    @staticmethod
    def get_department_by_id(department_id):
        """
        Return a single department by ID.
        """
        return get_object_or_404(
            Department,
            id=department_id,
             is_active=True,
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