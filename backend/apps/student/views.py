from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.permissions import IsAdmin
from apps.common.pagination import StandardResultsSetPagination

from .serializers import StudentSerializer
from .services import StudentService, StudentIDGenerator

class StudentListCreateView(APIView):
    """
    GET  : List all students
    POST : Register a new student
    """

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]

        return [IsAuthenticated(), IsAdmin()]

    def get(self, request):

        search = request.query_params.get("search")
        ordering = request.query_params.get("ordering")
        department = request.query_params.get("department")
        semester = request.query_params.get("semester")
        admission_status = request.query_params.get(
            "admission_status"
        )

        students = StudentService.get_all_students(
            search=search,
            ordering=ordering,
            department=department,
            semester=semester,
            admission_status=admission_status,
        )

        paginator = StandardResultsSetPagination()

        result = paginator.paginate_queryset(
            students,
            request,
        )

        serializer = StudentSerializer(
            result,
            many=True,
        )

        return paginator.get_paginated_response(
            serializer.data
        )

    def post(self, request):

        serializer = StudentSerializer(
            data=request.data
        )

        if serializer.is_valid():

            student = StudentService.register_student(
                serializer
            )

            return Response(
                StudentSerializer(student).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )
class StudentDetailView(APIView):
    """
    GET
    PUT
    DELETE
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):

        student = StudentService.get_student_by_id(
            student_id
        )

        serializer = StudentSerializer(student)

        return Response(serializer.data)

    def put(self, request, student_id):

        if not IsAdmin().has_permission(request, self):
            return Response(
                {
                    "detail": "Only administrators can update students."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        student = StudentService.get_student_by_id(
            student_id
        )

        serializer = StudentSerializer(
            student,
            data=request.data,
        )

        if serializer.is_valid():

            student = StudentService.update_student(
                serializer
            )

            return Response(
                StudentSerializer(student).data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, student_id):

        if not IsAdmin().has_permission(request, self):
            return Response(
                {
                    "detail": "Only administrators can delete students."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        student = StudentService.get_student_by_id(
            student_id
        )

        StudentService.delete_student(student)

        return Response(
            {
                "message": "Student deleted successfully."
            }
        )

class PendingStudentListView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    def get(self, request):

        students = StudentService.get_pending_students()

        serializer = StudentSerializer(
            students,
            many=True,
        )

        return Response(serializer.data)
class ApprovedStudentListView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    def get(self, request):

        students = StudentService.get_approved_students()

        serializer = StudentSerializer(
            students,
            many=True,
        )

        return Response(serializer.data)

class GenerateStudentIDView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    def post(self, request, student_id):

        student = StudentService.get_student_by_id(
            student_id
        )

        suggested_id = StudentIDGenerator.generate(
            student
        )

        return Response(
            {
                "suggested_student_id": suggested_id
            }
        )
class ApproveStudentView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    def post(self, request, student_id):

        student = StudentService.get_student_by_id(
            student_id
        )

        custom_student_id = request.data.get(
            "student_id"
        )

        student = StudentService.approve_student(
            student,
            custom_student_id,
        )

        return Response(
            StudentSerializer(student).data
        )

class RejectStudentView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    def post(self, request, student_id):

        student = StudentService.get_student_by_id(
            student_id
        )

        student = StudentService.reject_student(
            student
        )

        return Response(
            StudentSerializer(student).data
        )