from rest_framework import serializers
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.conf import settings
from django.core.mail import send_mail
from django.utils.encoding import force_bytes,force_str
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator



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
    @staticmethod
    def logout_user(refresh_token):
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return {"message": "Logout successful."}
        except TokenError:
            raise serializers.ValidationError({
                "refresh": "Invalid or expired refresh token."
            })

    @staticmethod
    def change_password(user, validated_data):
        """
        Change user password.
        """

        old_password = validated_data.get("old_password")
        new_password = validated_data.get("new_password")

        # Check old password
        if not user.check_password(old_password):
            raise serializers.ValidationError(
                {
                    "old_password": [
                        "Old password is incorrect."
                    ]
                }
            )

        # Set new password
        user.set_password(new_password)

        # Save user
        user.save()

        return {
            "message": "Password changed successfully."
        }
    
    @staticmethod
    def forgot_password(validated_data):
        """
        Send password reset email.
        """

        email = validated_data.get("email")

        user = User.objects.get(email=email)

        uid = urlsafe_base64_encode(
            force_bytes(user.pk)
        )

        token = default_token_generator.make_token(user)

        reset_link = (
            f"{settings.FRONTEND_URL}"
            f"/reset-password/{uid}/{token}/"
        )

        send_mail(
            subject="Password Reset Request",

            message=(
                f"Hello {user.first_name},\n\n"
                f"Click the link below to reset your password:\n\n"
                f"{reset_link}"
            ),

            from_email=settings.DEFAULT_FROM_EMAIL,

            recipient_list=[user.email],

            fail_silently=False,
        )

        return {
            "message":
                "Password reset link has been sent to your email."
        } 
    @staticmethod
    def reset_password(validated_data):
        """
        Reset user password.
        """

        uid = validated_data.get("uid")
        token = validated_data.get("token")
        new_password = validated_data.get("new_password")

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)

        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError(
                {
                    "uid": [
                        "Invalid reset link."
                    ]
                }
            )

        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError(
                {
                    "token": [
                        "Invalid or expired token."
                    ]
                }
            )

        user.set_password(new_password)
        user.save()

        return {
            "message": "Password reset successfully."
        }