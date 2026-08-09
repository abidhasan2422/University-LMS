from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.pagination import StandardResultsSetPagination
from apps.course_offering.models import CourseOffering
from apps.enrollments.models import Enrollment

from .models import Assessment, AssessmentMark
from .serializers import (
    AssessmentMarkSerializer,
    AssessmentSerializer,
)
from .services import AssessmentService


class AssessmentListCreateView(APIView):
    """
    GET:
        List assessments.

    POST:
        Create an assessment.

    Permissions:
        Admin       -> All assessments.
        Instructor  -> Own course offerings.
        Student     -> View own enrolled courses.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):

        search = request.query_params.get("search")
        ordering = request.query_params.get("ordering")
        course_offering = request.query_params.get(
            "course_offering"
        )
        assessment_type = request.query_params.get(
            "assessment_type"
        )

        # Student can only see assessments from
        # courses they are enrolled in.
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

            enrolled_course_offerings = (
                Enrollment.objects.filter(
                    student=request.user.student_profile,
                    status=Enrollment.Status.ENROLLED,
                    is_active=True,
                ).values_list(
                    "course_offering_id",
                    flat=True,
                )
            )

            queryset = Assessment.objects.filter(
                course_offering_id__in=(
                    enrolled_course_offerings
                ),
                is_active=True,
            ).select_related(
                "course_offering",
                "course_offering__course",
                "course_offering__instructor",
                "course_offering__instructor__user",
                "course_offering__semester",
            )

            if course_offering:
                queryset = queryset.filter(
                    course_offering_id=course_offering
                )

            if assessment_type:
                queryset = queryset.filter(
                    assessment_type=assessment_type
                )

            if search:
                queryset = queryset.filter(
                    title__icontains=search
                )

            if ordering:
                allowed_ordering = [
                    "title",
                    "-title",
                    "assessment_type",
                    "-assessment_type",
                    "maximum_marks",
                    "-maximum_marks",
                    "assessment_date",
                    "-assessment_date",
                    "created_at",
                    "-created_at",
                ]

                if ordering in allowed_ordering:
                    queryset = queryset.order_by(
                        ordering
                    )

            paginator = StandardResultsSetPagination()

            result = paginator.paginate_queryset(
                queryset,
                request,
            )

            serializer = AssessmentSerializer(
                result,
                many=True,
            )

            return paginator.get_paginated_response(
                serializer.data
            )

        # Admin / Instructor
        assessments = (
            AssessmentService.get_all_assessments(
                search=search,
                ordering=ordering,
                course_offering=course_offering,
                assessment_type=assessment_type,
            )
        )

        # Instructor can only see their own offerings.
        if (
            request.user.role == "INSTRUCTOR"
            and not request.user.is_staff
        ):
            assessments = assessments.filter(
                course_offering__instructor__user=request.user
            )

        paginator = StandardResultsSetPagination()

        result = paginator.paginate_queryset(
            assessments,
            request,
        )

        serializer = AssessmentSerializer(
            result,
            many=True,
        )

        return paginator.get_paginated_response(
            serializer.data
        )

    def post(self, request):

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
                        "You do not have permission "
                        "to create assessments."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AssessmentSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        course_offering = (
            serializer.validated_data[
                "course_offering"
            ]
        )

        # Instructor can only create assessments
        # for their own course offering.
        if (
            request.user.role == "INSTRUCTOR"
            and not request.user.is_staff
        ):
            if (
                course_offering.instructor.user
                != request.user
            ):
                return Response(
                    {
                        "detail": (
                            "You can only create "
                            "assessments for your own "
                            "course offerings."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        assessment = (
            AssessmentService.create_assessment(
                serializer
            )
        )

        return Response(
            AssessmentSerializer(
                assessment
            ).data,
            status=status.HTTP_201_CREATED,
        )


class AssessmentDetailView(APIView):
    """
    GET:
        Retrieve an assessment.

    PUT/PATCH:
        Update an assessment.

    DELETE:
        Soft delete an assessment.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, assessment_id):

        assessment = (
            AssessmentService.get_assessment_by_id(
                assessment_id
            )
        )

        # Students can only view assessments
        # for their enrolled courses.
        if (
            request.user.role == "STUDENT"
            and not request.user.is_staff
        ):
            is_enrolled = Enrollment.objects.filter(
                student=request.user.student_profile,
                course_offering=(
                    assessment.course_offering
                ),
                status=Enrollment.Status.ENROLLED,
                is_active=True,
            ).exists()

            if not is_enrolled:
                return Response(
                    {
                        "detail": (
                            "You do not have permission "
                            "to view this assessment."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        # Instructor can only view own assessment.
        if (
            request.user.role == "INSTRUCTOR"
            and not request.user.is_staff
        ):
            if (
                assessment.course_offering.instructor.user
                != request.user
            ):
                return Response(
                    {
                        "detail": (
                            "You do not have permission "
                            "to view this assessment."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = AssessmentSerializer(
            assessment
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, assessment_id):

        return self._update(
            request,
            assessment_id,
            partial=False,
        )

    def patch(self, request, assessment_id):

        return self._update(
            request,
            assessment_id,
            partial=True,
        )

    def _update(
        self,
        request,
        assessment_id,
        partial=False,
    ):

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
                        "You do not have permission "
                        "to update assessments."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        assessment = (
            AssessmentService.get_assessment_by_id(
                assessment_id
            )
        )

        # Instructor ownership check.
        if (
            request.user.role == "INSTRUCTOR"
            and not request.user.is_staff
        ):
            if (
                assessment.course_offering.instructor.user
                != request.user
            ):
                return Response(
                    {
                        "detail": (
                            "You can only update "
                            "your own assessments."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = AssessmentSerializer(
            assessment,
            data=request.data,
            partial=partial,
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        # If instructor changes the course offering,
        # make sure the new offering also belongs
        # to that instructor.
        new_course_offering = (
            serializer.validated_data.get(
                "course_offering"
            )
        )

        if (
            request.user.role == "INSTRUCTOR"
            and not request.user.is_staff
            and new_course_offering
        ):
            if (
                new_course_offering.instructor.user
                != request.user
            ):
                return Response(
                    {
                        "detail": (
                            "You cannot move an "
                            "assessment to another "
                            "instructor's course."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        assessment = (
            AssessmentService.update_assessment(
                serializer
            )
        )

        return Response(
            AssessmentSerializer(
                assessment
            ).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, assessment_id):

        if not (
            request.user.is_staff
            or request.user.role == "ADMIN"
        ):
            return Response(
                {
                    "detail": (
                        "Only administrators can "
                        "delete assessments."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        assessment = (
            AssessmentService.get_assessment_by_id(
                assessment_id
            )
        )

        AssessmentService.delete_assessment(
            assessment
        )

        return Response(
            {
                "message": (
                    "Assessment deleted successfully."
                )
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# Assessment Marks
# =========================================================


class AssessmentMarkListCreateView(APIView):
    """
    GET:
        List assessment marks.

    POST:
        Create a student's assessment mark.

    Permissions:
        Admin       -> All marks.
        Instructor  -> Own course marks.
        Student     -> Own marks only.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):

        search = request.query_params.get("search")
        ordering = request.query_params.get("ordering")
        assessment = request.query_params.get(
            "assessment"
        )
        enrollment = request.query_params.get(
            "enrollment"
        )
        student = request.query_params.get("student")
        course_offering = request.query_params.get(
            "course_offering"
        )
        assessment_type = request.query_params.get(
            "assessment_type"
        )

        # Student sees only their own marks.
        if (
            request.user.role == "STUDENT"
            and not request.user.is_staff
        ):
            student = request.user.student_profile.id

        marks = (
            AssessmentService.get_all_assessment_marks(
                search=search,
                ordering=ordering,
                assessment=assessment,
                enrollment=enrollment,
                student=student,
                course_offering=course_offering,
                assessment_type=assessment_type,
            )
        )

        # Instructor sees only marks from
        # their own course offerings.
        if (
            request.user.role == "INSTRUCTOR"
            and not request.user.is_staff
        ):
            marks = marks.filter(
                assessment__course_offering__instructor__user=(
                    request.user
                )
            )

        paginator = StandardResultsSetPagination()

        result = paginator.paginate_queryset(
            marks,
            request,
        )

        serializer = AssessmentMarkSerializer(
            result,
            many=True,
        )

        return paginator.get_paginated_response(
            serializer.data
        )

    def post(self, request):

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
                        "Students cannot enter "
                        "assessment marks."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AssessmentMarkSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        assessment = (
            serializer.validated_data[
                "assessment"
            ]
        )

        # Instructor ownership check.
        if (
            request.user.role == "INSTRUCTOR"
            and not request.user.is_staff
        ):
            if (
                assessment.course_offering
                .instructor
                .user
                != request.user
            ):
                return Response(
                    {
                        "detail": (
                            "You can only enter marks "
                            "for your own course offerings."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        mark = (
            AssessmentService.create_assessment_mark(
                serializer
            )
        )

        return Response(
            AssessmentMarkSerializer(
                mark
            ).data,
            status=status.HTTP_201_CREATED,
        )


class AssessmentMarkDetailView(APIView):
    """
    GET:
        Retrieve a mark.

    PUT/PATCH:
        Update a mark.

    DELETE:
        Soft delete a mark.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, mark_id):

        mark = (
            AssessmentService
            .get_assessment_mark_by_id(mark_id)
        )

        # Student can only view own mark.
        if (
            request.user.role == "STUDENT"
            and not request.user.is_staff
        ):
            if (
                mark.enrollment.student.user
                != request.user
            ):
                return Response(
                    {
                        "detail": (
                            "You do not have permission "
                            "to view this mark."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        # Instructor can only view own course marks.
        if (
            request.user.role == "INSTRUCTOR"
            and not request.user.is_staff
        ):
            if (
                mark.assessment
                .course_offering
                .instructor
                .user
                != request.user
            ):
                return Response(
                    {
                        "detail": (
                            "You do not have permission "
                            "to view this mark."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = AssessmentMarkSerializer(
            mark
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, mark_id):

        return self._update(
            request,
            mark_id,
            partial=False,
        )

    def patch(self, request, mark_id):

        return self._update(
            request,
            mark_id,
            partial=True,
        )

    def _update(
        self,
        request,
        mark_id,
        partial=False,
    ):

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
                        "Students cannot update "
                        "assessment marks."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        mark = (
            AssessmentService
            .get_assessment_mark_by_id(mark_id)
        )

        # Instructor ownership check.
        if (
            request.user.role == "INSTRUCTOR"
            and not request.user.is_staff
        ):
            if (
                mark.assessment
                .course_offering
                .instructor
                .user
                != request.user
            ):
                return Response(
                    {
                        "detail": (
                            "You can only update marks "
                            "for your own courses."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = AssessmentMarkSerializer(
            mark,
            data=request.data,
            partial=partial,
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        # If assessment is changed during update,
        # verify instructor owns the new assessment.
        new_assessment = (
            serializer.validated_data.get(
                "assessment"
            )
        )

        if (
            request.user.role == "INSTRUCTOR"
            and not request.user.is_staff
            and new_assessment
        ):
            if (
                new_assessment
                .course_offering
                .instructor
                .user
                != request.user
            ):
                return Response(
                    {
                        "detail": (
                            "You cannot move this mark "
                            "to another instructor's "
                            "assessment."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        mark = (
            AssessmentService.update_assessment_mark(
                serializer
            )
        )

        return Response(
            AssessmentMarkSerializer(
                mark
            ).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, mark_id):

        if not (
            request.user.is_staff
            or request.user.role == "ADMIN"
        ):
            return Response(
                {
                    "detail": (
                        "Only administrators can "
                        "delete assessment marks."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        mark = (
            AssessmentService
            .get_assessment_mark_by_id(mark_id)
        )

        AssessmentService.delete_assessment_mark(
            mark
        )

        return Response(
            {
                "message": (
                    "Assessment mark deleted successfully."
                )
            },
            status=status.HTTP_200_OK,
        )