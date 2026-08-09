from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.permissions import IsAdmin
from apps.common.pagination import StandardResultsSetPagination

from .serializers import AttendanceSerializer,AttendanceSummarySerializer
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

class AttendanceSummaryView(APIView):
    """
    Return attendance statistics for a student.

    Students can view their own summary.
    Admins can view any student's summary.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):

        student_id = request.query_params.get(
            "student"
        )

        course_offering = request.query_params.get(
            "course_offering"
        )

        # Student must only see their own summary.
        if (
            request.user.role == "STUDENT"
            and not request.user.is_staff
        ):
            if not hasattr(
                request.user,
                "student_profile",
            ):
                return Response(
                    {
                        "detail": (
                            "Student profile not found."
                        )
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            student = request.user.student_profile

            # Ignore manually supplied student ID.
            student_id = student.id

        else:

            if not student_id:
                return Response(
                    {
                        "student": (
                            "Student ID is required."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            from apps.student.models import Student

            try:
                student = Student.objects.get(
                    id=student_id,
                    is_active=True,
                )
            except Student.DoesNotExist:
                return Response(
                    {
                        "student": (
                            "Student not found."
                        )
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

        summary = (
            AttendanceService
            .get_student_attendance_summary(
                student=student,
                course_offering=course_offering,
            )
        )

        response_data = {
            "student_id": student.student_id,
            "student_name": (
                student.user.get_full_name()
            ),
            **summary,
        }

        if course_offering:

            from apps.course_offering.models import (
                CourseOffering,
            )

            try:
                offering = (
                    CourseOffering.objects
                    .select_related("course")
                    .get(
                        id=course_offering,
                        is_active=True,
                    )
                )

                response_data.update(
                    {
                        "course_offering": offering.id,
                        "course_code": (
                            offering.course.course_code
                        ),
                        "course_title": (
                            offering.course.course_title
                        ),
                    }
                )

            except CourseOffering.DoesNotExist:
                return Response(
                    {
                        "course_offering": (
                            "Course offering not found."
                        )
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

        serializer = AttendanceSummarySerializer(
            response_data
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )