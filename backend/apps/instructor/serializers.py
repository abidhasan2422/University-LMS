from datetime import date

from rest_framework import serializers

from apps.users.models import User, UserRole
from apps.departments.models import Department

from .models import Instructor


class InstructorSerializer(serializers.ModelSerializer):
    """
    Serializer for Instructor model.
    """

    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()
    )

    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all()
    )

    full_name = serializers.SerializerMethodField()

    department_name = serializers.CharField(
        source="department.name",
        read_only=True,
    )

    first_name = serializers.CharField(
        source="user.first_name",
        read_only=True,
    )

    last_name = serializers.CharField(
        source="user.last_name",
        read_only=True,
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    mobile = serializers.CharField(
        source="user.mobile",
        read_only=True,
    )

    class Meta:
        model = Instructor

        fields = (
            "id",
            "user",
            "full_name",
            "first_name",
            "last_name",
            "email",
            "mobile",
            "employee_id",
            "department",
            "department_name",
            "designation",
            "qualification",
            "specialization",
            "joining_date",
            "experience_years",
            "office_phone",
            "office_room",
            "profile_picture",
            "employment_status",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "employee_id",
            "created_at",
            "updated_at",
        )

    def get_full_name(self, obj):
        """
        Return instructor full name.
        """
        return obj.user.get_full_name()

    def validate_joining_date(self, value):
        """
        Validate joining date.
        """
        if value > date.today():
            raise serializers.ValidationError(
                "Joining date cannot be in the future."
            )

        return value

    def validate_experience_years(self, value):
        """
        Validate experience.
        """
        if value < 0:
            raise serializers.ValidationError(
                "Experience cannot be negative."
            )

        if value > 60:
            raise serializers.ValidationError(
                "Invalid experience."
            )

        return value

    def validate(self, attrs):
        """
        Business validation.
        """

        user = attrs.get("user")

        if (
            user
            and Instructor.objects.filter(user=user).exists()
            and self.instance is None
        ):
            raise serializers.ValidationError(
                {
                    "user": (
                        "This user already has an instructor profile."
                    )
                }
            )

        if user and user.role != User.Role.INSTRUCTOR:
            raise serializers.ValidationError(
                {
                    "user": (
                        "Selected user must have the INSTRUCTOR role."
                    )
                }
            )

        return attrs