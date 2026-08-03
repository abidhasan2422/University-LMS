from django.contrib import admin

from .models import Course


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """
    Admin configuration for Course model.
    """

    list_display = (
        "id",
        "course_code",
        "course_title",
        "department",
        "semester",
        "credit",
        "is_active",
        "created_at",
    )

    search_fields = (
        "course_code",
        "course_title",
        "department__name",
        "semester__name",
    )

    list_filter = (
        "department",
        "semester",
        "credit",
        "is_active",
    )

    ordering = (
        "course_code",
    )

    list_select_related = (
        "department",
        "semester",
    )

    list_per_page = 20