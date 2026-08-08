from django.contrib import admin

from .models import Enrollment


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    """
    Admin configuration for Enrollment.
    """

    list_display = (
        "student",
        "course_offering",
        "enrollment_date",
        "status",
        "is_active",
        "created_at",
    )

    search_fields = (
        "student__student_id",
        "student__user__first_name",
        "student__user__last_name",
        "student__user__email",
        "course_offering__course__course_code",
        "course_offering__course__course_title",
    )

    list_filter = (
        "status",
        "enrollment_date",
        "is_active",
        "course_offering__semester",
        "course_offering__academic_year",
    )

    ordering = (
        "-enrollment_date",
    )

    list_select_related = (
        "student",
        "student__user",
        "course_offering",
        "course_offering__course",
        "course_offering__instructor",
        "course_offering__semester",
    )

    readonly_fields = (
        "enrollment_date",
        "created_at",
        "updated_at",
    )

    list_per_page = 20

    fieldsets = (
        (
            "Enrollment Information",
            {
                "fields": (
                    "student",
                    "course_offering",
                    "enrollment_date",
                    "status",
                )
            },
        ),
        (
            "System Information",
            {
                "fields": (
                    "is_active",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )