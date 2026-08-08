from datetime import date

from rest_framework import serializers

from apps.enrollments.models import Enrollment

from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    """
    Serializer for Attendance.
    """

    enrollment = serializers.PrimaryKeyRelatedField(
        queryset=Enrollment.objects.select_related(
            "student",
            "student__user",
            "course_offering",
            "course_offering__course",
            "course_offering__semester",
        )
    )

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

    course_offering_id = serializers.IntegerField(
        source="enrollment.course_offering.id",
        read_only=True,
    )

    semester_name = serializers.CharField(
        source="enrollment.course_offering.semester.name",
        read_only=True,
    )

    section = serializers.CharField(
        source="enrollment.course_offering.section",
        read_only=True,
    )

    class Meta:
        model = Attendance

        fields = (
            "id",
            "enrollment",
            "student_id_code",
            "student_name",
            "course_offering_id",
            "course_code",
            "course_title",
            "semester_name",
            "section",
            "date",
            "status",
            "remarks",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

    def get_student_name(self, obj):
        """
        Return student's full name.
        """
        return obj.enrollment.student.user.get_full_name()

    def validate_date(self, value):
        """
        Attendance cannot be recorded for a future date.
        """
        if value > date.today():
            raise serializers.ValidationError(
                "Attendance date cannot be in the future."
            )

        return value

    def validate(self, attrs):
        """
        Validate attendance data.
        """

        enrollment = attrs.get("enrollment")
        attendance_date = attrs.get("date")

        if enrollment and attendance_date:

            if enrollment.status != Enrollment.Status.ENROLLED:
                raise serializers.ValidationError(
                    {
                        "enrollment": (
                            "Attendance can only be recorded "
                            "for an active enrollment."
                        )
                    }
                )

            if not enrollment.is_active:
                raise serializers.ValidationError(
                    {
                        "enrollment": (
                            "This enrollment is no longer active."
                        )
                    }
                )

        return attrs