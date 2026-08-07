from django.contrib import admin

from .models import Instructor


@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    """
    Admin configuration for Instructor model.
    """

    list_display = (
        "employee_id",
        "user",
        "department",
        "designation",
        "employment_status",
        "joining_date",
        "is_active",
        "created_at",
    )

    search_fields = (
        "employee_id",
        "user__first_name",
        "user__last_name",
        "user__email",
        "department__name",
        "qualification",
        "specialization",
    )

    list_filter = (
        "department",
        "designation",
        "employment_status",
        "joining_date",
        "is_active",
    )

    ordering = (
        "-joining_date",
    )

    list_select_related = (
        "user",
        "department",
    )

    readonly_fields = (
        "employee_id",
        "created_at",
        "updated_at",
    )

    list_per_page = 20

    fieldsets = (
        (
            "User Information",
            {
                "fields": (
                    "user",
                    "employee_id",
                    "department",
                )
            },
        ),
        (
            "Professional Information",
            {
                "fields": (
                    "designation",
                    "qualification",
                    "specialization",
                    "joining_date",
                    "experience_years",
                )
            },
        ),
        (
            "Office Information",
            {
                "fields": (
                    "office_phone",
                    "office_room",
                )
            },
        ),
        (
            "Profile",
            {
                "fields": (
                    "profile_picture",
                    "employment_status",
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