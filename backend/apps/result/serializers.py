from rest_framework import serializers

from apps.enrollments.models import Enrollment

from .models import Result


class ResultSerializer(serializers.ModelSerializer):
    """
    Serializer for student course results.

    Result values are calculated by the backend.
    Students cannot modify their result manually.
    """

    student_id_code = serializers.CharField(
        source="enrollment.student.student_id",
        read_only=True,
    )

    student_name = serializers.SerializerMethodField()

    course_code = serializers.CharField(
        source="enrollment.course_offering.course.course_code",
        read_only=True,
    )

    course_title = serializers.CharField(
        source="enrollment.course_offering.course.course_title",
        read_only=True,
    )

    course_type = serializers.CharField(
        source="enrollment.course_offering.course.course_type",
        read_only=True,
    )

    section = serializers.CharField(
        source="enrollment.course_offering.section",
        read_only=True,
    )

    semester_name = serializers.CharField(
        source="enrollment.course_offering.semester.name",
        read_only=True,
    )

    academic_year = serializers.CharField(
        source="enrollment.course_offering.academic_year",
        read_only=True,
    )

    class Meta:
        model = Result

        fields = (
            "id",
            "enrollment",
            "student_id_code",
            "student_name",
            "course_code",
            "course_title",
            "course_type",
            "section",
            "semester_name",
            "academic_year",
            "total_marks",
            "percentage",
            "letter_grade",
            "grade_point",
            "status",
            "is_published",
            "published_at",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "total_marks",
            "percentage",
            "letter_grade",
            "grade_point",
            "status",
            "published_at",
            "created_at",
            "updated_at",
        )

    def get_student_name(self, obj):
        """
        Return student's full name.
        """

        return obj.enrollment.student.user.get_full_name()

    def validate_enrollment(self, value):
        if not value.is_active:
            raise serializers.ValidationError(
                "This enrollment is inactive."
            )

        if value.status not in [
            Enrollment.Status.ENROLLED,
            Enrollment.Status.COMPLETED,
        ]:
            raise serializers.ValidationError(
                "A result can only be generated for an enrolled "
                "or completed student."
            )

        existing_result = Result.objects.filter(
            enrollment=value
        ).exclude(pk=getattr(self.instance, "pk", None)).exists()

        if existing_result:
            raise serializers.ValidationError(
                "A result already exists for this enrollment."
            )

        return value

class SemesterGPASerializer(serializers.Serializer):
    semester_gpa = serializers.DecimalField(
        max_digits=3,
        decimal_places=2,
    )
    total_credits = serializers.DecimalField(
        max_digits=6,
        decimal_places=2,
    )
    courses = serializers.ListField(
        child=serializers.DictField()
    )


class CGPASerializer(serializers.Serializer):
    """
    Serializer for cumulative GPA.
    """

    cgpa = serializers.DecimalField(
        max_digits=3,
        decimal_places=2,
    )

    total_credits = serializers.DecimalField(
        max_digits=6,
        decimal_places=2,
    )