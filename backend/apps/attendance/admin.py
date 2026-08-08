from django.contrib import admin

from .models import Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    """
    Admin configuration for Attendance.
    """

    list_display = (
        "student_id",
        "student_name",
        "course_code",
        "course_title",
        "date",
        "status",
        "is_active",
        "created_at",
    )

    search_fields = (
        "enrollment__student__student_id",
        "enrollment__student__user__first_name",
        "enrollment__student__user__last_name",
        "enrollment__student__user__email",
        "enrollment__course_offering__course__course_code",
        "enrollment__course_offering__course__course_title",
    )

    list_filter = (
        "status",
        "date",
        "is_active",
        "enrollment__course_offering__semester",
        "enrollment__course_offering__academic_year",
    )

    ordering = (
        "-date",
    )

    list_select_related = (
        "enrollment",
        "enrollment__student",
        "enrollment__student__user",
        "enrollment__course_offering",
        "enrollment__course_offering__course",
        "enrollment__course_offering__semester",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_per_page = 25

    fieldsets = (
        (
            "Attendance Information",
            {
                "fields": (
                    "enrollment",
                    "date",
                    "status",
                    "remarks",
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

    @admin.display(
        description="Student ID",
        ordering="enrollment__student__student_id",
    )
    def student_id(self, obj):
        return obj.enrollment.student.student_id

    @admin.display(
        description="Student Name",
        ordering="enrollment__student__user__first_name",
    )
    def student_name(self, obj):
        return obj.enrollment.student.user.get_full_name()

    @admin.display(
        description="Course Code",
        ordering="enrollment__course_offering__course__course_code",
    )
    def course_code(self, obj):
        return obj.enrollment.course_offering.course.course_code

    @admin.display(
        description="Course Title",
        ordering="enrollment__course_offering__course__course_title",
    )
    def course_title(self, obj):
        return obj.enrollment.course_offering.course.course_title