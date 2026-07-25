
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import RegisterSerializer,LoginSerializer,ProfileSerializer,LogoutSerializer,ChangePasswordSerializer,ForgotPasswordSerializer, ResetPasswordSerializer
from .services import AuthenticationService


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
    Change Password API
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data
        )

        if serializer.is_valid():

            response = AuthenticationService.change_password(
                request.user,
                serializer.validated_data,
            )

            return Response(
                response,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )
class ForgotPasswordView(APIView):
    """
    Forgot Password API
    """

    def post(self, request):

        serializer = ForgotPasswordSerializer(
            data=request.data
        )

        if serializer.is_valid():

            response = AuthenticationService.forgot_password(
                serializer.validated_data
            )

            return Response(
                response,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )
class ResetPasswordView(APIView):
    """
    Reset Password API
    """

    def post(self, request):

        serializer = ResetPasswordSerializer(
            data=request.data
        )

        if serializer.is_valid():

            response = AuthenticationService.reset_password(
                serializer.validated_data
            )

            return Response(
                response,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )