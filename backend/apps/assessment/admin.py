from django.contrib import admin

from .models import Assessment, AssessmentMark


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    """
    Admin configuration for Assessment.
    """

    list_display = (
        "course_code",
        "course_title",
        "assessment_type",
        "assessment_type",
        "maximum_marks",
        "assessment_date",
        "is_active",
        "created_at",
    )

    search_fields = (
   
        "course_offering__course__course_code",
        "course_offering__course__course_title",
        "course_offering__instructor__user__first_name",
        "course_offering__instructor__user__last_name",
    )

    list_filter = (
        "assessment_type",
        "assessment_date",
        "is_active",
        "course_offering__semester",
        "course_offering__academic_year",
    )

    ordering = (
        "assessment_date",
        "created_at",
    )

    list_select_related = (
        "course_offering",
        "course_offering__course",
        "course_offering__instructor",
        "course_offering__semester",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_per_page = 20

    fieldsets = (
        (
            "Assessment Information",
            {
                "fields": (
                    "course_offering",
                    "assessment_type",
                    "maximum_marks",
                    "assessment_date",
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
        description="Course Code",
        ordering="course_offering__course__course_code",
    )
    def course_code(self, obj):
        return obj.course_offering.course.course_code

    @admin.display(
        description="Course Title",
        ordering="course_offering__course__course_title",
    )
    def course_title(self, obj):
        return obj.course_offering.course.course_title


@admin.register(AssessmentMark)
class AssessmentMarkAdmin(admin.ModelAdmin):
    """
    Admin configuration for Assessment Marks.
    """

    list_display = (
        "student_id",
        "student_name",
        "course_code",
        "assessment_title",
        "assessment_type",
        "maximum_marks",
        "obtained_marks",
        "is_active",
        "created_at",
    )

    search_fields = (
        "enrollment__student__student_id",
        "enrollment__student__user__first_name",
        "enrollment__student__user__last_name",
        "enrollment__student__user__email",
        "assessment__title",
        "assessment__course_offering__course__course_code",
        "assessment__course_offering__course__course_title",
    )

    list_filter = (
        "assessment__assessment_type",
        "assessment__assessment_date",
        "is_active",
        "assessment__course_offering__semester",
        "assessment__course_offering__academic_year",
    )

    ordering = (
        "-created_at",
    )

    list_select_related = (
        "assessment",
        "assessment__course_offering",
        "assessment__course_offering__course",
        "enrollment",
        "enrollment__student",
        "enrollment__student__user",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_per_page = 25

    fieldsets = (
        (
            "Mark Information",
            {
                "fields": (
                    "assessment",
                    "enrollment",
                    "obtained_marks",
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
        ordering="assessment__course_offering__course__course_code",
    )
    def course_code(self, obj):
        return (
            obj.assessment
            .course_offering
            .course
            .course_code
        )

    @admin.display(
        description="Assessment",
        ordering="assessment__title",
    )
    def assessment_title(self, obj):
        return obj.assessment.title

    @admin.display(
        description="Type",
        ordering="assessment__assessment_type",
    )
    def assessment_type(self, obj):
        return obj.assessment.assessment_type

    @admin.display(
        description="Maximum Marks",
        ordering="assessment__maximum_marks",
    )
    def maximum_marks(self, obj):
        return obj.assessment.maximum_marks