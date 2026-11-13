
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.enrollments.models import Enrollment

from .models import Result
from .serializers import ResultSerializer
from .services import ResultService


# ============================================================
# Helper Functions
# ============================================================

def is_admin(user):
    """Check whether the user is an administrator."""
    return user.is_staff or user.role == "ADMIN"


def is_instructor(user):
    """Check whether the user is an instructor."""
    return user.role == "INSTRUCTOR"


def is_student(user):
    """Check whether the user is a student."""
    return user.role == "STUDENT"


def get_result_or_404(result_id):
    """Retrieve an active result or return 404."""
    return get_object_or_404(
        Result.objects.select_related(
            "enrollment",
            "enrollment__student",
            "enrollment__student__user",
            "enrollment__course_offering",
            "enrollment__course_offering__course",
            "enrollment__course_offering__semester",
            "enrollment__course_offering__instructor",
        ),
        id=result_id,
    )


def get_student_profile(user):
    """Return the student's profile or None."""
    return getattr(user, "student_profile", None)


def handle_service_validation_error(exc):
    """Convert service validation errors into API responses."""
    if isinstance(exc, DjangoValidationError):
        return Response(
            {"detail": exc.messages},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if isinstance(exc, DRFValidationError):
        return Response(
            exc.detail,
            status=status.HTTP_400_BAD_REQUEST,
        )

    return None


# ============================================================
# Result List and Create
# ============================================================

class ResultListCreateView(APIView):
    """
    GET:
        Admin:
            View all results.

        Instructor:
            View results for their own course offerings.

        Student:
            View only their own published results.

    POST:
        Admin:
            Generate any result.

        Instructor:
            Generate results for their own course offerings.

        Student:
            Cannot generate results.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # ----------------------------------------------------
        # Role Permission
        # ----------------------------------------------------

        if not (
            is_admin(request.user)
            or is_instructor(request.user)
            or is_student(request.user)
        ):
            return Response(
                {"detail": "You do not have permission to view results."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # ----------------------------------------------------
        # Query Parameters
        # ----------------------------------------------------

        student = request.query_params.get("student")
        course_offering = request.query_params.get("course_offering")
        semester = request.query_params.get("semester")
        academic_year = request.query_params.get("academic_year")
        result_status = request.query_params.get("status")

        is_published = request.query_params.get("is_published")

        if is_published is not None:
            value = is_published.lower()

            if value not in ["true", "false"]:
                return Response(
                    {
                        "is_published": (
                            "Enter either 'true' or 'false'."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            is_published = value == "true"

        # ----------------------------------------------------
        # Student Restrictions
        # ----------------------------------------------------

        if is_student(request.user) and not is_admin(request.user):

            student_profile = get_student_profile(request.user)

            if student_profile is None:
                return Response(
                    {"detail": "Student profile not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Students can only view their own results.
            student = student_profile.id

            # Students can only view published results.
            is_published = True

        # ----------------------------------------------------
        # Get Results
        # ----------------------------------------------------

        results = ResultService.get_all_results(
            student=student,
            course_offering=course_offering,
            semester=semester,
            academic_year=academic_year,
            status=result_status,
            is_published=is_published,
        )

        # ----------------------------------------------------
        # Instructor Restrictions
        # ----------------------------------------------------

        if is_instructor(request.user) and not is_admin(request.user):

            results = results.filter(
                enrollment__course_offering__instructor__user=request.user
            )

        serializer = ResultSerializer(
            results,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        """Generate a result from an enrollment."""

        # ----------------------------------------------------
        # Permission
        # ----------------------------------------------------

        if not (
            is_admin(request.user)
            or is_instructor(request.user)
        ):
            return Response(
                {"detail": "Students cannot generate results."},
                status=status.HTTP_403_FORBIDDEN,
            )

        enrollment_id = request.data.get("enrollment")

        if not enrollment_id:
            return Response(
                {"enrollment": "Enrollment is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Get Enrollment
        # ----------------------------------------------------

        enrollment = get_object_or_404(
            Enrollment.objects.select_related(
                "student",
                "student__user",
                "course_offering",
                "course_offering__course",
                "course_offering__instructor",
                "course_offering__instructor__user",
                "course_offering__semester",
            ),
            id=enrollment_id,
        )

        # ----------------------------------------------------
        # Instructor Ownership
        # ----------------------------------------------------

        if is_instructor(request.user) and not is_admin(request.user):

            if (
                enrollment.course_offering.instructor.user
                != request.user
            ):
                return Response(
                    {
                        "detail": (
                            "You can only generate results for "
                            "your own course offerings."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        # ----------------------------------------------------
        # Generate Result
        # ----------------------------------------------------

        try:
            result = ResultService.generate_result(enrollment)

        except (DjangoValidationError, DRFValidationError) as exc:
            return handle_service_validation_error(exc)

        except IntegrityError:
            return Response(
                {
                    "detail": (
                        "A result already exists for this enrollment "
                        "or a database constraint was violated."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            ResultSerializer(result).data,
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# Result Detail
# ============================================================

class ResultDetailView(APIView):
    """
    GET:
        Admin:
            View any result.

        Instructor:
            View results for their own course offerings.

        Student:
            View their own published result.

    PUT/PATCH:
        Not allowed because result values are calculated.

    DELETE:
        Admin only.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, result_id):

        if not (
            is_admin(request.user)
            or is_instructor(request.user)
            or is_student(request.user)
        ):
            return Response(
                {"detail": "You do not have permission to view results."},
                status=status.HTTP_403_FORBIDDEN,
            )

        result = get_result_or_404(result_id)

        # ----------------------------------------------------
        # Student Permission
        # ----------------------------------------------------

        if is_student(request.user) and not is_admin(request.user):

            if result.enrollment.student.user != request.user:
                return Response(
                    {
                        "detail": (
                            "You do not have permission to view this result."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            if not result.is_published:
                return Response(
                    {
                        "detail": (
                            "This result has not been published yet."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        # ----------------------------------------------------
        # Instructor Permission
        # ----------------------------------------------------

        if is_instructor(request.user) and not is_admin(request.user):

            if (
                result.enrollment.course_offering.instructor.user
                != request.user
            ):
                return Response(
                    {
                        "detail": (
                            "You do not have permission to view this result."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = ResultSerializer(result)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, result_id):

        return Response(
            {
                "detail": (
                    "Result marks cannot be manually updated. "
                    "Regenerate the result from attendance and "
                    "assessment marks."
                )
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def patch(self, request, result_id):

        return Response(
            {
                "detail": (
                    "Result marks cannot be manually updated. "
                    "Regenerate the result from attendance and "
                    "assessment marks."
                )
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def delete(self, request, result_id):

        if not is_admin(request.user):
            return Response(
                {"detail": "Only administrators can delete results."},
                status=status.HTTP_403_FORBIDDEN,
            )

        result = get_result_or_404(result_id)

        result.soft_delete()

        return Response(
            {"message": "Result deleted successfully."},
            status=status.HTTP_200_OK,
        )


# ============================================================
# Publish / Unpublish Result
# ============================================================

class ResultPublishView(APIView):
    """
    POST:
        Publish a result.

    DELETE:
        Unpublish a result.

    Only administrators can publish or unpublish results.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, result_id):

        if not is_admin(request.user):
            return Response(
                {"detail": "Only administrators can publish results."},
                status=status.HTTP_403_FORBIDDEN,
            )

        result = get_result_or_404(result_id)

        try:
            result = ResultService.publish_result(result)

        except (DjangoValidationError, DRFValidationError) as exc:
            return handle_service_validation_error(exc)

        return Response(
            {
                "message": "Result published successfully.",
                "result": ResultSerializer(result).data,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, result_id):

        if not is_admin(request.user):
            return Response(
                {"detail": "Only administrators can unpublish results."},
                status=status.HTTP_403_FORBIDDEN,
            )

        result = get_result_or_404(result_id)

        try:
            result = ResultService.unpublish_result(result)

        except (DjangoValidationError, DRFValidationError) as exc:
            return handle_service_validation_error(exc)

        return Response(
            {
                "message": "Result unpublished successfully.",
                "result": ResultSerializer(result).data,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# Semester GPA
# ============================================================

class SemesterGPAView(APIView):
    """
    Return semester GPA for a student.

    Student:
        Can view their own semester GPA.

    Admin:
        Can view any student's semester GPA.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # ----------------------------------------------------
        # Role Permission
        # ----------------------------------------------------

        if not (
            is_admin(request.user)
            or is_student(request.user)
        ):
            return Response(
                {"detail": "You do not have permission to view GPA."},
                status=status.HTTP_403_FORBIDDEN,
            )

        student_id = request.query_params.get("student")
        semester_id = request.query_params.get("semester")
        academic_year = request.query_params.get("academic_year")

        # ----------------------------------------------------
        # Student Restriction
        # ----------------------------------------------------

        if is_student(request.user) and not is_admin(request.user):

            student_profile = get_student_profile(request.user)

            if student_profile is None:
                return Response(
                    {"detail": "Student profile not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            student_id = student_profile.id

        # ----------------------------------------------------
        # Validation
        # ----------------------------------------------------

        if not student_id:
            return Response(
                {"student": "Student ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not semester_id:
            return Response(
                {"semester": "Semester ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Calculate GPA
        # ----------------------------------------------------

        try:
            data = ResultService.calculate_semester_gpa(
                student_id=student_id,
                semester_id=semester_id,
                academic_year=academic_year,
            )

        except (DjangoValidationError, DRFValidationError) as exc:
            return handle_service_validation_error(exc)

        return Response(
            data,
            status=status.HTTP_200_OK,
        )


# ============================================================
# CGPA
# ============================================================

class CGPAView(APIView):
    """
    Return cumulative GPA for a student.

    Student:
        Can view their own CGPA.

    Admin:
        Can view any student's CGPA.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # ----------------------------------------------------
        # Role Permission
        # ----------------------------------------------------

        if not (
            is_admin(request.user)
            or is_student(request.user)
        ):
            return Response(
                {"detail": "You do not have permission to view CGPA."},
                status=status.HTTP_403_FORBIDDEN,
            )

        student_id = request.query_params.get("student")

        # ----------------------------------------------------
        # Student Restriction
        # ----------------------------------------------------

        if is_student(request.user) and not is_admin(request.user):

            student_profile = get_student_profile(request.user)

            if student_profile is None:
                return Response(
                    {"detail": "Student profile not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            student_id = student_profile.id

        # ----------------------------------------------------
        # Validation
        # ----------------------------------------------------

        if not student_id:
            return Response(
                {"student": "Student ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Calculate CGPA
        # ----------------------------------------------------

        try:
            data = ResultService.calculate_cgpa(student_id)

        except (DjangoValidationError, DRFValidationError) as exc:
            return handle_service_validation_error(exc)

        return Response(
            data,
            status=status.HTTP_200_OK,
        )
