from datetime import date

from rest_framework import serializers

from apps.course.models import Course
from apps.instructor.models import Instructor
from apps.semester.models import Semester

from .models import CourseOffering


class CourseOfferingSerializer(serializers.ModelSerializer):
    """
    Serializer for Course Offering.
    """

    course = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all()
    )

    instructor = serializers.PrimaryKeyRelatedField(
        queryset=Instructor.objects.all()
    )

    semester = serializers.PrimaryKeyRelatedField(
        queryset=Semester.objects.all()
    )

    course_code = serializers.CharField(
        source="course.course_code",
        read_only=True,
    )

    course_title = serializers.CharField(
        source="course.course_title",
        read_only=True,
    )

    instructor_name = serializers.SerializerMethodField()

    employee_id = serializers.CharField(
        source="instructor.employee_id",
        read_only=True,
    )

    semester_name = serializers.CharField(
        source="semester.name",
        read_only=True,
    )

    available_seats = serializers.SerializerMethodField()

    class Meta:
        model = CourseOffering

        fields = (
            "id",
            "course",
            "course_code",
            "course_title",
            "instructor",
            "instructor_name",
            "employee_id",
            "semester",
            "semester_name",
            "academic_year",
            "section",
            "capacity",
            "available_seats",
            "room",
            "day",
            "start_time",
            "end_time",
            "status",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

    def get_instructor_name(self, obj):
        """
        Return instructor full name.
        """
        return obj.instructor.user.get_full_name()

    def get_available_seats(self, obj):
        """
        Return available seats.
        """
        if hasattr(obj, "available_seats"):
            return obj.available_seats

        return obj.capacity

    def validate_academic_year(self, value):
        """
        Validate academic year.
        """
        current_year = date.today().year

        if value < 2000:
            raise serializers.ValidationError(
                "Academic year cannot be less than 2000."
            )

        if value > current_year + 2:
            raise serializers.ValidationError(
                "Invalid academic year."
            )

        return value

    def validate_capacity(self, value):
        """
        Validate course capacity.
        """
        if value <= 0:
            raise serializers.ValidationError(
                "Capacity must be greater than zero."
            )

        if value > 300:
            raise serializers.ValidationError(
                "Capacity cannot exceed 300."
            )

        return value

    def validate(self, attrs):
        """
        Business validation.
        """

        start_time = attrs.get("start_time")
        end_time = attrs.get("end_time")

        if start_time and end_time:
            if start_time >= end_time:
                raise serializers.ValidationError(
                    {
                        "end_time": (
                            "End time must be later than start time."
                        )
                    }
                )

        return attrs