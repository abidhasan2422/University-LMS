from rest_framework import serializers

from apps.departments.models import Department
from apps.semester.models import Semester

from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer for Course model.
    """

    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all()
    )

    semester = serializers.PrimaryKeyRelatedField(
        queryset=Semester.objects.all()
    )

    department_name = serializers.CharField(
        source="department.name",
        read_only=True,
    )

    semester_name = serializers.CharField(
        source="semester.name",
        read_only=True,
    )

    class Meta:
        model = Course

        fields = (
            "id",
            "department",
            "department_name",
            "semester",
            "semester_name",
            "course_code",
            "course_title",
            "credit",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

    def validate_credit(self, value):
        """
        Validate course credit.
        """

        if value <= 0:
            raise serializers.ValidationError(
                "Credit must be greater than zero."
            )

        if value > 6:
            raise serializers.ValidationError(
                "Credit cannot be greater than 6."
            )

        return value

    def validate(self, attrs):
        """
        Additional business validations.
        """

        department = attrs.get("department")
        semester = attrs.get("semester")

        if department is None:
            raise serializers.ValidationError(
                {
                    "department": "Department is required."
                }
            )

        if semester is None:
            raise serializers.ValidationError(
                {
                    "semester": "Semester is required."
                }
            )

        return attrs