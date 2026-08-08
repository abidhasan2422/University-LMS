from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.permissions import IsAdmin
from apps.common.pagination import StandardResultsSetPagination

from .serializers import AttendanceSerializer
from .services import AttendanceService


class AttendanceListCreateView(APIView):
    """
    GET:
        List attendance records.

    POST:
        Create an attendance record.

    Permissions:
        Admin       -> Can view and create.
        Instructor  -> Can view and create.
        Student     -> Can view own attendance only.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):

        search = request.query_params.get("search")
        ordering = request.query_params.get("ordering")
        enrollment = request.query_params.get("enrollment")
        student = request.query_params.get("student")
        course_offering = request.query_params.get(
            "course_offering"
        )
        attendance_date = request.query_params.get("date")
        attendance_status = request.query_params.get("status")

        # Students can only view their own attendance.
        if (
            hasattr(request.user, "student_profile")
            and request.user.role == "STUDENT"
            and not request.user.is_staff
        ):
            student = request.user.student_profile.id

        attendance = AttendanceService.get_all_attendance(
            search=search,
            ordering=ordering,
            enrollment=enrollment,
            student=student,
            course_offering=course_offering,
            date=attendance_date,
            status=attendance_status,
        )

        paginator = StandardResultsSetPagination()

        result = paginator.paginate_queryset(
            attendance,
            request,
        )

        serializer = AttendanceSerializer(
            result,
            many=True,
        )

        return paginator.get_paginated_response(
            serializer.data
        )

    def post(self, request):
        """
        Create an attendance record.

        Currently restricted to Admin and Instructor.
        """

        if not (
            request.user.is_staff
            or request.user.role in ["ADMIN", "INSTRUCTOR"]
        ):
            return Response(
                {
                    "detail": (
                        "You do not have permission to "
                        "create attendance."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AttendanceSerializer(
            data=request.data
        )

        if serializer.is_valid():

            attendance = (
                AttendanceService.create_attendance(
                    serializer
                )
            )

            return Response(
                AttendanceSerializer(
                    attendance
                ).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class AttendanceDetailView(APIView):
    """
    GET:
        Retrieve attendance.

    PUT:
        Update attendance.

    PATCH:
        Partially update attendance.

    DELETE:
        Soft delete attendance.

    Permissions:
        Admin       -> Full access.
        Instructor  -> View/update.
        Student     -> Own attendance view only.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, attendance_id):

        attendance = (
            AttendanceService.get_attendance_by_id(
                attendance_id
            )
        )

        # Student can only view own attendance.
        if (
            request.user.role == "STUDENT"
            and not request.user.is_staff
        ):
            if attendance.enrollment.student.user != request.user:
                return Response(
                    {
                        "detail": (
                            "You do not have permission "
                            "to view this attendance."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = AttendanceSerializer(
            attendance
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, attendance_id):

        if not (
            request.user.is_staff
            or request.user.role in ["ADMIN", "INSTRUCTOR"]
        ):
            return Response(
                {
                    "detail": (
                        "You do not have permission "
                        "to update attendance."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        attendance = (
            AttendanceService.get_attendance_by_id(
                attendance_id
            )
        )

        serializer = AttendanceSerializer(
            attendance,
            data=request.data,
        )

        if serializer.is_valid():

            attendance = (
                AttendanceService.update_attendance(
                    serializer
                )
            )

            return Response(
                AttendanceSerializer(
                    attendance
                ).data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def patch(self, request, attendance_id):

        if not (
            request.user.is_staff
            or request.user.role in ["ADMIN", "INSTRUCTOR"]
        ):
            return Response(
                {
                    "detail": (
                        "You do not have permission "
                        "to update attendance."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        attendance = (
            AttendanceService.get_attendance_by_id(
                attendance_id
            )
        )

        serializer = AttendanceSerializer(
            attendance,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():

            attendance = (
                AttendanceService.update_attendance(
                    serializer
                )
            )

            return Response(
                AttendanceSerializer(
                    attendance
                ).data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, attendance_id):

        if not (
            request.user.is_staff
            or request.user.role == "ADMIN"
        ):
            return Response(
                {
                    "detail": (
                        "Only administrators can delete "
                        "attendance records."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        attendance = (
            AttendanceService.get_attendance_by_id(
                attendance_id
            )
        )

        AttendanceService.delete_attendance(
            attendance
        )

        return Response(
            {
                "message": (
                    "Attendance deleted successfully."
                )
            },
            status=status.HTTP_200_OK,
        )