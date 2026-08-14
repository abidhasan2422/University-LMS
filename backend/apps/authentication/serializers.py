from rest_framework import serializers
from django.contrib.auth import authenticate
from apps.users.models import User, UserRole
from django.contrib.auth import password_validation
from .validators import (validate_phone_number,validate_password_strength,)
from django.contrib.auth import (get_user_model)
from django.contrib.auth.tokens import ( default_token_generator)
from django.utils.encoding import (force_str)
from django.utils.http import (urlsafe_base64_decode)
class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)

    email = serializers.EmailField()

    phone_number = serializers.CharField(
        max_length=20,
        validators=[validate_phone_number]
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
    
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User

        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "role",
            "status",
            "created_at",
        ]

        read_only_fields = fields
class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()




class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing the password of
    the currently authenticated user.
    """

    old_password = serializers.CharField(
        write_only=True,
        required=True,
    )

    new_password = serializers.CharField(
        write_only=True,
        required=True,
    )

    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
    )

    def validate(self, attrs):

        user = self.context["request"].user

    
        # Check old password
     

        if not user.check_password(
            attrs["old_password"]
        ):
            raise serializers.ValidationError(
                {
                    "old_password": (
                        "Old password is incorrect."
                    )
                }
            )

        # Check new password confirmation
     
        if (
            attrs["new_password"]
            != attrs["confirm_password"]
        ):
            raise serializers.ValidationError(
                {
                    "confirm_password": (
                        "New passwords do not match."
                    )
                }
            )

        # Prevent same password
       
        if (
            attrs["old_password"]
            == attrs["new_password"]
        ):
            raise serializers.ValidationError(
                {
                    "new_password": (
                        "New password must be different "
                        "from the old password."
                    )
                }
            )

        
        # Django password validation
        password_validation.validate_password(
            attrs["new_password"],
            user,
        )

        return attrs
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "No account found with this email."
            )

        return value

User = get_user_model()


class ResetPasswordSerializer(serializers.Serializer):
    """
    Serializer for setting a new password using
    a password reset token.
    """

    uid = serializers.CharField()

    token = serializers.CharField()

    new_password = serializers.CharField(
        write_only=True,
    )

    confirm_password = serializers.CharField(
        write_only=True,
    )

    def validate(self, attrs):

        # Decode user ID

        try:
            user_id = force_str(
                urlsafe_base64_decode(
                    attrs["uid"]
                )
            )

            user = User.objects.get(
                pk=user_id
            )

        except (
            TypeError,
            ValueError,
            OverflowError,
            User.DoesNotExist,
        ):
            raise serializers.ValidationError(
                {
                    "uid": (
                        "Invalid password reset link."
                    )
                }
            )

        # Validate token

        if not default_token_generator.check_token(
            user,
            attrs["token"],
        ):
            raise serializers.ValidationError(
                {
                    "token": (
                        "Invalid or expired "
                        "password reset link."
                    )
                }
            )

        # Confirm password
        

        if (
            attrs["new_password"]
            != attrs["confirm_password"]
        ):
            raise serializers.ValidationError(
                {
                    "confirm_password": (
                        "Passwords do not match."
                    )
                }
            )

        # Password validation

        password_validation.validate_password(
            attrs["new_password"],
            user,
        )

        attrs["user"] = user

        return attrs