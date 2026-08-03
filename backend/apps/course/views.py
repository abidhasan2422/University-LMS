from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.authentication.permissions import IsAdmin
from apps.common.pagination import StandardResultsSetPagination
from .serializers import CourseSerializer
from .services import CourseService


class CourseListCreateView(APIView):
    """
    GET  : List all courses
    POST : Create a course
    """

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get(self, request):
        search = request.query_params.get("search")
        ordering = request.query_params.get("ordering")
        department = request.query_params.get("department")
        semester = request.query_params.get("semester")

        courses = CourseService.get_all_courses(
            search=search,
            ordering=ordering,
            department=department,
            semester=semester,
        )

        paginator = StandardResultsSetPagination()

        result = paginator.paginate_queryset(
            courses,
            request,
        )

        serializer = CourseSerializer(
            result,
            many=True,
        )

        return paginator.get_paginated_response(
            serializer.data
        )

    def post(self, request):
        serializer = CourseSerializer(
            data=request.data,
        )

        if serializer.is_valid():
            course = CourseService.create_course(
                serializer
            )

            return Response(
                CourseSerializer(course).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class CourseDetailView(APIView):
    """
    GET    : Retrieve a course
    PUT    : Update a course
    DELETE : Soft delete a course
    """

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get(self, request, course_id):
        course = CourseService.get_course_by_id(
            course_id
        )

        serializer = CourseSerializer(
            course
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, course_id):
        course = CourseService.get_course_by_id(
            course_id
        )

        serializer = CourseSerializer(
            course,
            data=request.data,
        )

        if serializer.is_valid():
            course = CourseService.update_course(
                serializer
            )

            return Response(
                CourseSerializer(course).data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, course_id):
        course = CourseService.get_course_by_id(
            course_id
        )

        CourseService.delete_course(
            course
        )

        return Response(
            {
                "message": "Course deleted successfully."
            },
            status=status.HTTP_200_OK,
        )