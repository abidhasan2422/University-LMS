from rest_framework import serializers
from apps.student.models import Student
from apps.course_offering.models import CourseOffering
from .models import Enrollment

class EnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Student Enrollments.
    """
    student = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all()
    )
    course_offering = serializers.PrimaryKeyRelatedField(
        queryset=CourseOffering.objects.all()
    )
    
    # Read-only contextual fields for clean frontend consumption
    student_id_code = serializers.CharField(
        source="student.student_id",
        read_only=True,
    )
    student_name = serializers.CharField(
        source="student.user.get_full_name",
        read_only=True,
    )
    course_code = serializers.CharField(
        source="course_offering.course.course_code",
        read_only=True,
    )
    course_title = serializers.CharField(
        source="course_offering.course.course_title",
        read_only=True,
    )
    section = serializers.CharField(
        source="course_offering.section",
        read_only=True,
    )
    semester_name = serializers.CharField(
        source="course_offering.semester.name",
        read_only=True,
    )

    class Meta:
        model = Enrollment
        fields = (
            "id",
            "student",
            "student_id_code",
            "student_name",
            "course_offering",
            "course_code",
            "course_title",
            "section",
            "semester_name",
            "status",
            "enrollment_date",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "status",
            "enrollment_date",
            "created_at",
            "updated_at",
        )