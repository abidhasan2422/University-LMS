
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import RegisterSerializer,LoginSerializer,ProfileSerializer
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