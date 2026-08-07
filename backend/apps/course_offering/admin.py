from django.contrib import admin

from .models import CourseOffering


@admin.register(CourseOffering)
class CourseOfferingAdmin(admin.ModelAdmin):
    """
    Admin configuration for Course Offering.
    """

    list_display = (
        "course",
        "instructor",
        "semester",
        "academic_year",
        "section",
        "room",
        "day",
        "start_time",
        "end_time",
        "capacity",
        "status",
        "is_active",
    )

    search_fields = (
        "course__course_code",
        "course__course_title",
        "instructor__user__first_name",
        "instructor__user__last_name",
        "room",
    )

    list_filter = (
        "semester",
        "academic_year",
        "section",
        "day",
        "status",
        "is_active",
    )

    ordering = (
        "-academic_year",
        "semester",
        "course",
    )

    list_select_related = (
        "course",
        "instructor",
        "semester",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_per_page = 20

    fieldsets = (
        (
            "Course Information",
            {
                "fields": (
                    "course",
                    "instructor",
                    "semester",
                    "academic_year",
                    "section",
                )
            },
        ),
        (
            "Schedule",
            {
                "fields": (
                    "day",
                    "start_time",
                    "end_time",
                    "room",
                )
            },
        ),
        (
            "Enrollment",
            {
                "fields": (
                    "capacity",
                    "status",
                )
            },
        ),
        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )