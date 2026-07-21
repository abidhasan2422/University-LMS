from rest_framework import serializers
from django.contrib.auth import authenticate
from apps.users.models import User, UserRole
from .validators import (
    validate_phone_number,
    validate_password_strength,
)


class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)

    email = serializers.EmailField()

    phone_number = serializers.CharField(
        max_length=20,
        validators=[validate_phone_number]
    )

    role = serializers.ChoiceField(
        choices=UserRole.choices
    )

    password = serializers.CharField(
        write_only=True,
        validators=[validate_password_strength]
    )

    confirm_password = serializers.CharField(
        write_only=True
    )

    def validate_email(self, value):
        """
        Check if email already exists.
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Email already exists."
            )

        return value

    def validate_phone_number(self, value):
        """
        Check if phone number already exists.
        """
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError(
                "Phone number already exists."
            )

        return value

    def validate(self, attrs):
        """
        Validate password confirmation.
        """

        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {
                    "confirm_password":
                        "Passwords do not match."
                }
            )

        return attrs

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(
            username=email,
            password=password,
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        attrs["user"] = user
        return attrs