from rest_framework import serializers
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

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
    
@staticmethod
def login_user(user):
    """
    Authenticate user and generate JWT tokens.
    """

    # Check account status
    if user.status == AccountStatus.PENDING:
        raise serializers.ValidationError({
            "detail": "Your instructor account is pending administrator approval."
        })

    if user.status == AccountStatus.REJECTED:
        raise serializers.ValidationError({
            "detail": "Your registration has been rejected."
        })

    if user.status == AccountStatus.SUSPENDED:
        raise serializers.ValidationError({
            "detail": "Your account has been suspended."
        })

    if not user.is_active:
        raise serializers.ValidationError({
            "detail": "Your account has been deactivated."
        })

    # Generate JWT Tokens
    refresh = RefreshToken.for_user(user)

    return {
        "message": "Login successful.",
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "role": user.role,
            "status": user.status,
        }
    }