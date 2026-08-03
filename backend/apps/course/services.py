from django.shortcuts import get_object_or_404

from apps.common.query_service import QueryService

from .models import Course


class CourseService:
    """
    Service layer for Course business logic.
    """

    @staticmethod
    def create_course(serializer):
        """
        Create a new course.
        """
        return serializer.save()

    @staticmethod
    def get_all_courses(
        search=None,
        ordering=None,
        department=None,
        semester=None,
    ):
        """
        Return all courses with search, ordering, and filtering.
        """

        queryset = Course.objects.select_related(
            "department",
            "semester",
        )

        return QueryService.apply(
            queryset=queryset,
            search=search,
            search_fields=[
                "course_code",
                "course_title",
                "department__name",
                "semester__name",
            ],
            ordering=ordering,
            allowed_ordering=[
                "course_code",
                "-course_code",
                "course_title",
                "-course_title",
                "credit",
                "-credit",
                "created_at",
                "-created_at",
            ],
            filters={
                "department_id": department,
                "semester_id": semester,
            },
        )

    @staticmethod
    def get_course_by_id(course_id):
        """
        Return a single course by ID.
        """
        return get_object_or_404(
            Course.objects.select_related(
                "department",
                "semester",
            ),
            id=course_id,
        )

    @staticmethod
    def update_course(serializer):
        """
        Update an existing course.
        """
        return serializer.save()

    @staticmethod
    def delete_course(course):
        """
        Soft delete a course.
        """
        course.soft_delete()
        return course

    @staticmethod
    def restore_course(course):
        """
        Restore a soft deleted course.
        """
        course.restore()
        return course

    @staticmethod
    def get_all_courses_for_admin():
        """
        Return all courses including soft deleted.
        """
        return Course.all_objects.select_related(
            "department",
            "semester",
        )

    @staticmethod
    def get_deleted_courses():
        """
        Return only soft deleted courses.
        """
        return Course.all_objects.filter(
            is_active=False
        ).select_related(
            "department",
            "semester",
        )