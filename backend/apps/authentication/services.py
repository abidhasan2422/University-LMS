from rest_framework import serializers

from apps.users.models import (
    User,
    UserRole,
    AccountStatus,
)


class AuthenticationService:
    @staticmethod
    def register_user(validated_data):
        """
        Register a new user based on role.
        """

        # Remove confirm_password because it is not a model field
        validated_data.pop("confirm_password")

        role = validated_data.get("role")

        # Admin registration is not allowed
        if role == UserRole.ADMIN:
            raise serializers.ValidationError(
                {
                    "role": "Admin registration is not allowed."
                }
            )

        # Student registration
        if role == UserRole.STUDENT:
            validated_data["status"] = AccountStatus.ACTIVE

        # Instructor registration
        elif role == UserRole.INSTRUCTOR:
            validated_data["status"] = AccountStatus.PENDING

        user = User.objects.create_user(**validated_data)

        return user