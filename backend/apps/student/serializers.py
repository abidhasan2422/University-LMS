from datetime import date

from rest_framework import serializers

from apps.departments.models import Department
from apps.semester.models import Semester

from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    """
    Serializer for Student model.
    """

    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all()
    )

    semester = serializers.PrimaryKeyRelatedField(
        queryset=Semester.objects.all()
    )

    full_name = serializers.SerializerMethodField()

    department_name = serializers.CharField(
        source="department.name",
        read_only=True,
    )

    semester_name = serializers.CharField(
        source="semester.name",
        read_only=True,
    )

    class Meta:
        model = Student

        fields = (
            "id",
            "full_name",
            "student_id",
            "department",
            "department_name",
            "semester",
            "semester_name",
            "admission_year",
            "session",
            "gender",
            "date_of_birth",
            "blood_group",
            "profile_picture",
            "present_address",
            "permanent_address",
            "guardian_name",
            "guardian_phone",
            "status",
            "admission_status",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "student_id",
            "admission_status",
            "created_at",
            "updated_at",
        )

    def get_full_name(self, obj):
        return obj.user.get_full_name()

    def validate_admission_year(self, value):

        current_year = date.today().year

        if value < 2000:
            raise serializers.ValidationError(
                "Admission year cannot be less than 2000."
            )

        if value > current_year + 1:
            raise serializers.ValidationError(
                "Invalid admission year."
            )

        return value

    def validate_guardian_phone(self, value):

        if len(value) < 11:
            raise serializers.ValidationError(
                "Guardian phone number is invalid."
            )

        return value