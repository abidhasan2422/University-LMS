from django.contrib import admin

from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    """
    Admin configuration for Student model.
    """

    list_display = (
        "student_id",
        "user",
        "department",
        "semester",
        "admission_year",
        "admission_status",
        "status",
        "is_active",
        "created_at",
    )

    search_fields = (
        "student_id",
        "user__first_name",
        "user__last_name",
        "user__email",
        "department__name",
    )

    list_filter = (
        "department",
        "semester",
        "admission_status",
        "status",
        "is_active",
        "admission_year",
    )

    ordering = (
        "-created_at",
    )

    list_select_related = (
        "user",
        "department",
        "semester",
    )

    readonly_fields = (
        "student_id",
        "created_at",
        "updated_at",
    )

    list_per_page = 20