from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.permissions import IsAdmin
from apps.common.pagination import StandardResultsSetPagination

from .serializers import SemesterSerializer
from .services import SemesterService


class SemesterListCreateView(APIView):
    """
    GET  : List all semesters
    POST : Create a semester
    """

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get(self, request):
        search = request.query_params.get("search")
        ordering = request.query_params.get("ordering")

        semesters = SemesterService.get_all_semesters(
            search=search,
            ordering=ordering,
        )

        paginator = StandardResultsSetPagination()

        result = paginator.paginate_queryset(
            semesters,
            request,
        )

        serializer = SemesterSerializer(
            result,
            many=True,
        )

        return paginator.get_paginated_response(
            serializer.data
        )

    def post(self, request):
        serializer = SemesterSerializer(
            data=request.data,
        )

        if serializer.is_valid():
            semester = SemesterService.create_semester(
                serializer
            )

            return Response(
                SemesterSerializer(semester).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class SemesterDetailView(APIView):
    """
    GET    : Retrieve a semester
    PUT    : Update a semester
    DELETE : Soft delete a semester
    """

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get(self, request, semester_id):
        semester = SemesterService.get_semester_by_id(
            semester_id
        )

        serializer = SemesterSerializer(
            semester
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, semester_id):
        semester = SemesterService.get_semester_by_id(
            semester_id
        )

        serializer = SemesterSerializer(
            semester,
            data=request.data,
        )

        if serializer.is_valid():
            semester = SemesterService.update_semester(
                serializer
            )

            return Response(
                SemesterSerializer(semester).data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, semester_id):
        semester = SemesterService.get_semester_by_id(
            semester_id
        )

        SemesterService.delete_semester(
            semester
        )

        return Response(
            {
                "message": "Semester deleted successfully."
            },
            status=status.HTTP_200_OK,
        )