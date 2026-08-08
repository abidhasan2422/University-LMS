from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.permissions import IsAdmin
from apps.common.pagination import StandardResultsSetPagination

from .serializers import EnrollmentSerializer
from .services import EnrollmentService
from .models import Enrollment


class EnrollmentListCreateView(APIView):
    """
    GET  : List all enrollments (Admin sees all, students can filter)
    POST : Enroll a student into a course offering
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get("search")
        ordering = request.query_params.get("ordering")
        student = request.query_params.get("student")
        course_offering = request.query_params.get("course_offering")
        enrollment_status = request.query_params.get("status")

        # If the user is a student (not an admin/instructor), restrict them to viewing only their own enrollments
        if hasattr(request.user, "student_profile") and not request.user.is_staff and request.user.role == "STUDENT":
            student = request.user.student_profile.id

        enrollments = EnrollmentService.get_all_enrollments(
            search=search,
            ordering=ordering,
            student=student,
            course_offering=course_offering,
            status=enrollment_status,
        )

        paginator = StandardResultsSetPagination()
        result = paginator.paginate_queryset(enrollments, request)
        serializer = EnrollmentSerializer(result, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = EnrollmentSerializer(data=request.data)
        
        if serializer.is_valid():
            enrollment = EnrollmentService.enroll_student(serializer)
            return Response(
                EnrollmentSerializer(enrollment).data,
                status=status.HTTP_201_CREATED,
            )
            
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class EnrollmentDetailView(APIView):
    """
    GET    : Retrieve specific enrollment
    DELETE : Drop/Cancel an enrollment
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, enrollment_id):
        try:
            enrollment = Enrollment.objects.select_related(
                "student", "student__user", "course_offering__course"
            ).get(id=enrollment_id)
        except Enrollment.DoesNotExist:
            return Response(
                {"detail": "Enrollment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Security check: Students can only view their own enrollments
        if hasattr(request.user, "student_profile") and not request.user.is_staff:
            if enrollment.student.user != request.user:
                return Response(
                    {"detail": "You do not have permission to view this enrollment."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, enrollment_id):
        try:
            enrollment = Enrollment.objects.get(id=enrollment_id)
        except Enrollment.DoesNotExist:
            return Response(
                {"detail": "Enrollment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Security check: Students can only drop their own enrollments unless admin
        if hasattr(request.user, "student_profile") and not request.user.is_staff:
            if enrollment.student.user != request.user:
                return Response(
                    {"detail": "You do not have permission to drop this enrollment."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        EnrollmentService.drop_enrollment(enrollment)
        return Response(
            {"message": "Course enrollment dropped successfully."},
            status=status.HTTP_200_OK,
        )