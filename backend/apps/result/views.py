from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.enrollments.models import Enrollment

from .models import Result
from .serializers import ResultSerializer
from .services import ResultService


class ResultListCreateView(APIView):
    """
    GET:
        Admin:
            View all results.

        Instructor:
            View results for their own courses.

        Student:
            View only their own published results.

    POST:
        Generate a result.

        Admin:
            Can generate any result.

        Instructor:
            Can generate results for their own courses.

        Student:
            Cannot generate results.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.query_params.get("student")
        course_offering = request.query_params.get(
            "course_offering"
        )
        semester = request.query_params.get("semester")
        academic_year = request.query_params.get(
            "academic_year"
        )
        result_status = request.query_params.get("status")

        is_published = request.query_params.get(
            "is_published"
        )

        # Convert query parameter to boolean
        if is_published is not None:
            is_published = (
                is_published.lower() == "true"
            )

        # -----------------------------------------------------
        # Student
        # -----------------------------------------------------

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
                        "detail": "Student profile not found."
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Student can only see own results.
            student = request.user.student_profile.id

            # Student can only see published results.
            is_published = True

        # -----------------------------------------------------
        # Get results
        # -----------------------------------------------------

        results = ResultService.get_all_results(
            student=student,
            course_offering=course_offering,
            semester=semester,
            academic_year=academic_year,
            status=result_status,
            is_published=is_published,
        )

        # -----------------------------------------------------
        # Instructor
        # -----------------------------------------------------

        if (
            request.user.role == "INSTRUCTOR"
            and not request.user.is_staff
        ):
            results = results.filter(
                enrollment__course_offering__instructor__user=(
                    request.user
                )
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
        """
        Generate result from enrollment.
        """

        # -----------------------------------------------------
        # Permission
        # -----------------------------------------------------

        if not (
            request.user.is_staff
            or request.user.role in [
                "ADMIN",
                "INSTRUCTOR",
            ]
        ):
            return Response(
                {
                    "detail": (
                        "Students cannot generate "
                        "results."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        enrollment_id = request.data.get(
            "enrollment"
        )

        if not enrollment_id:
            return Response(
                {
                    "enrollment": (
                        "Enrollment is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            enrollment = Enrollment.objects.select_related(
                "student",
                "student__user",
                "course_offering",
                "course_offering__course",
                "course_offering__instructor",
            ).get(
                id=enrollment_id
            )

        except Enrollment.DoesNotExist:
            return Response(
                {
                    "enrollment": (
                        "Enrollment not found."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # -----------------------------------------------------
        # Instructor ownership
        # -----------------------------------------------------

        if (
            request.user.role == "INSTRUCTOR"
            and not request.user.is_staff
        ):
            if (
                enrollment.course_offering.instructor.user
                != request.user
            ):
                return Response(
                    {
                        "detail": (
                            "You can only generate "
                            "results for your own "
                            "course offerings."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        # -----------------------------------------------------
        # Generate Result
        # -----------------------------------------------------

        result = ResultService.generate_result(
            enrollment
        )

        return Response(
            ResultSerializer(result).data,
            status=status.HTTP_201_CREATED,
        )


class ResultDetailView(APIView):
    """
    GET:
        View a specific result.

    PUT/PATCH:
        Not allowed because result values are calculated
        by the Result Service.

    DELETE:
        Admin only.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, result_id):

        result = ResultService.get_result_by_id(
            result_id
        )

        # -----------------------------------------------------
        # Student
        # -----------------------------------------------------

        if (
            request.user.role == "STUDENT"
            and not request.user.is_staff
        ):
            if (
                result.enrollment.student.user
                != request.user
            ):
                return Response(
                    {
                        "detail": (
                            "You do not have permission "
                            "to view this result."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Students can only see published results.
            if not result.is_published:
                return Response(
                    {
                        "detail": (
                            "This result has not been "
                            "published yet."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        # -----------------------------------------------------
        # Instructor
        # -----------------------------------------------------

        if (
            request.user.role == "INSTRUCTOR"
            and not request.user.is_staff
        ):
            if (
                result.enrollment
                .course_offering
                .instructor
                .user
                != request.user
            ):
                return Response(
                    {
                        "detail": (
                            "You do not have permission "
                            "to view this result."
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
                    "Result marks cannot be manually "
                    "updated. Regenerate the result "
                    "from attendance and assessment marks."
                )
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def patch(self, request, result_id):
        return Response(
            {
                "detail": (
                    "Result marks cannot be manually "
                    "updated. Regenerate the result "
                    "from attendance and assessment marks."
                )
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def delete(self, request, result_id):

        # Only Admin can delete results.
        if not (
            request.user.is_staff
            or request.user.role == "ADMIN"
        ):
            return Response(
                {
                    "detail": (
                        "Only administrators can "
                        "delete results."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        result = ResultService.get_result_by_id(
            result_id
        )

        result.soft_delete()

        return Response(
            {
                "message": (
                    "Result deleted successfully."
                )
            },
            status=status.HTTP_200_OK,
        )


class ResultPublishView(APIView):
    """
    Publish or unpublish a result.

    POST:
        Publish result.

    DELETE:
        Unpublish result.

    Only Admin can publish/unpublish results.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, result_id):

        if not (
            request.user.is_staff
            or request.user.role == "ADMIN"
        ):
            return Response(
                {
                    "detail": (
                        "Only administrators can "
                        "publish results."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        result = ResultService.get_result_by_id(
            result_id
        )

        result = ResultService.publish_result(
            result
        )

        return Response(
            {
                "message": (
                    "Result published successfully."
                ),
                "result": ResultSerializer(
                    result
                ).data,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, result_id):

        if not (
            request.user.is_staff
            or request.user.role == "ADMIN"
        ):
            return Response(
                {
                    "detail": (
                        "Only administrators can "
                        "unpublish results."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        result = ResultService.get_result_by_id(
            result_id
        )

        result = ResultService.unpublish_result(
            result
        )

        return Response(
            {
                "message": (
                    "Result unpublished successfully."
                ),
                "result": ResultSerializer(
                    result
                ).data,
            },
            status=status.HTTP_200_OK,
        )