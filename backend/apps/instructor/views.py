from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.permissions import IsAdmin
from apps.common.pagination import StandardResultsSetPagination

from .serializers import InstructorSerializer
from .services import InstructorService


class InstructorListCreateView(APIView):
    """
    GET  : List all instructors
    POST : Create instructor
    """

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get(self, request):

        search = request.query_params.get("search")
        ordering = request.query_params.get("ordering")
        department = request.query_params.get("department")
        designation = request.query_params.get("designation")
        employment_status = request.query_params.get("employment_status")

        instructors = InstructorService.get_all_instructors(
            search=search,
            ordering=ordering,
            department=department,
            designation=designation,
            employment_status=employment_status,
        )

        paginator = StandardResultsSetPagination()

        result = paginator.paginate_queryset(
            instructors,
            request,
        )

        serializer = InstructorSerializer(
            result,
            many=True,
        )

        return paginator.get_paginated_response(
            serializer.data
        )

    def post(self, request):

        serializer = InstructorSerializer(
            data=request.data,
        )

        if serializer.is_valid():

            instructor = InstructorService.create_instructor(
                serializer
            )

            return Response(
                InstructorSerializer(instructor).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class InstructorDetailView(APIView):
    """
    GET
    PUT
    DELETE
    """

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get(self, request, instructor_id):

        instructor = InstructorService.get_instructor_by_id(
            instructor_id
        )

        serializer = InstructorSerializer(instructor)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, instructor_id):

        instructor = InstructorService.get_instructor_by_id(
            instructor_id
        )

        serializer = InstructorSerializer(
            instructor,
            data=request.data,
        )

        if serializer.is_valid():

            instructor = InstructorService.update_instructor(
                serializer
            )

            return Response(
                InstructorSerializer(instructor).data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, instructor_id):

        instructor = InstructorService.get_instructor_by_id(
            instructor_id
        )

        InstructorService.delete_instructor(
            instructor
        )

        return Response(
            {
                "message": "Instructor deleted successfully."
            },
            status=status.HTTP_200_OK,
        )
class InstructorDashboardView(APIView):
    """
    Return dashboard information for the
    currently authenticated instructor.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):

        dashboard = InstructorService.get_instructor_dashboard(
            request.user
        )

        return Response(
            dashboard,
            status=status.HTTP_200_OK,
        )