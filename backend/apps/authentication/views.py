
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import RegisterSerializer,LoginSerializer,ProfileSerializer,LogoutSerializer,ChangePasswordSerializer,ForgotPasswordSerializer, ResetPasswordSerializer
from .services import AuthenticationService
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import (
    default_token_generator,
)
from django.core.mail import send_mail
from django.utils.encoding import (
    force_bytes,
)
from django.utils.http import (
    urlsafe_base64_encode,
)

class RegisterView(APIView):
    """
    User Registration API
    """

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():

            user = AuthenticationService.register_user(
                serializer.validated_data
            )

            return Response(
                {
                    "message": "Registration successful.",
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "role": user.role,
                        "status": user.status,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )
    



class LoginView(APIView):
    """
    User Login API
    """
    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():

            response = AuthenticationService.login_user(
                serializer.validated_data["user"]
            )

            return Response(
                response,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )
    
class ProfileView(APIView):
    """
    User Profile API
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )
class LogoutView(APIView):
    """
    Logout API
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = LogoutSerializer(
            data=request.data
        )

        if serializer.is_valid():

            response = AuthenticationService.logout_user(
                serializer.validated_data["refresh"]
            )

            return Response(
                response,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class ChangePasswordView(APIView):
    """
    Change password for the currently authenticated user.

    Works for:
        Student
        Instructor
        Admin
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = ChangePasswordSerializer(
            data=request.data,
            context={
                "request": request,
            },
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user

        user.set_password(
            serializer.validated_data[
                "new_password"
            ]
        )

        user.save(
            update_fields=[
                "password",
            ]
        )

        return Response(
            {
                "message": (
                    "Password changed successfully."
                )
            },
            status=status.HTTP_200_OK,
 
        )

User = get_user_model()
class ForgotPasswordView(APIView):
    """
    Send password reset link to the user's email.
    """
   
    permission_classes = []

    def post(self, request):

        serializer = ForgotPasswordSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(
                email__iexact=email
            )
        except User.DoesNotExist:

            # Don't reveal whether the email exists.
            return Response(
                {
                    "message": (
                        "If an account exists with "
                        "this email, a password reset "
                        "link has been sent."
                    )
                },
                status=status.HTTP_200_OK,
            )

       
        # Generate UID

        uid = urlsafe_base64_encode(
            force_bytes(user.pk)
        )

        # Generate secure token

        token = default_token_generator.make_token(
            user
        )

        # Frontend reset URL

        reset_url = (
            f"http://localhost:3000/"
            f"reset-password/{uid}/{token}/"
        )

        # Email

        send_mail(
            subject="Reset Your LMS Password",
            message=(
                "You requested a password reset.\n\n"
                f"Reset your password here:\n"
                f"{reset_url}\n\n"
                "If you did not request this, "
                "you can ignore this email."
            ),
            from_email=None,
            recipient_list=[
                user.email
            ],
            fail_silently=False,
        )

        return Response(
            {
                "message": (
                    "If an account exists with "
                    "this email, a password reset "
                    "link has been sent."
                )
            },
            status=status.HTTP_200_OK,
        )
class ResetPasswordView(APIView):
    """
    Reset password using a valid reset token.
    """

    permission_classes = []

    def post(self, request):

        serializer = ResetPasswordSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.validated_data[
            "user"
        ]

        user.set_password(
            serializer.validated_data[
                "new_password"
            ]
        )

        user.save(
            update_fields=[
                "password",
            ]
        )

        return Response(
            {
                "message": (
                    "Password reset successfully."
                )
            },
            status=status.HTTP_200_OK,
        )
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdmin


class AdminOnlyView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response({
            "message": "Welcome Admin!"
        })