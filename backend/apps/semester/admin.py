from django.contrib import admin

from .models import Semester


@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    """
    Admin configuration for Semester model.
    """

    list_display = (
        "id",
        "name",
        "year",
        "start_date",
        "end_date",
        "is_active",
        "created_at",
    )

    search_fields = (
        "name",
        "year",
    )

    list_filter = (
        "name",
        "year",
        "is_active",
    )

    ordering = (
        "-year",
        "name",
    )

    list_per_page = 20