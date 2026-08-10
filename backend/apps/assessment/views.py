from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.pagination import StandardResultsSetPagination
from apps.enrollments.models import Enrollment

from .models import Assessment
from .serializers import (
    AssessmentMarkSerializer,
    AssessmentSerializer,
)
from .services import AssessmentService


class AssessmentListCreateView(APIView):
    """
    GET:
        List assessments.

        Admin:
            Can see all assessments.

        Instructor:
            Can see assessments belonging to their
            own course offerings.

        Student:
            Can see assessments belonging to courses
            in which they are currently enrolled.

    POST:
        Create an assessment.

        Admin:
            Can create for any course offering.

        Instructor:
            Can create only for their own course offerings.

        Student:
            Cannot create assessments.
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

        assessments = AssessmentService.get_all_assessments(
            search=search,
            ordering=ordering,
            course_offering=course_offering,
            assessment_type=assessment_type,
        )

        # =====================================================
        # STUDENT
        # =====================================================

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

            assessments = assessments.filter(
                course_offering_id__in=(
                    enrolled_course_offerings
                )
            )

        # =====================================================
        # INSTRUCTOR
        # =====================================================

        elif (
            request.user.role == "INSTRUCTOR"
            and not request.user.is_staff
        ):
            assessments = assessments.filter(
                course_offering__instructor__user=request.user
            )

        # =====================================================
        # ADMIN
        # =====================================================

        # Admin does not need additional filtering.

        # =====================================================
        # PAGINATION
        # =====================================================

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
                        "You do not have permission "
                        "to create assessments."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # -----------------------------------------------------
        # Validate request
        # -----------------------------------------------------

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

        # -----------------------------------------------------
        # Instructor ownership
        # -----------------------------------------------------

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

        # -----------------------------------------------------
        # Create assessment
        # -----------------------------------------------------

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

    PUT:
        Update an assessment.

    PATCH:
        Partially update an assessment.

    DELETE:
        Soft delete an assessment.

    Admin:
        Full access.

    Instructor:
        Can access only their own course offerings.

    Student:
        Can only view assessments from courses
        they are enrolled in.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, assessment_id):

        assessment = (
            AssessmentService.get_assessment_by_id(
                assessment_id
            )
        )

        # =====================================================
        # STUDENT
        # =====================================================

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

        # =====================================================
        # INSTRUCTOR
        # =====================================================

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
                        "You do not have permission "
                        "to update assessments."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # -----------------------------------------------------
        # Get assessment
        # -----------------------------------------------------

        assessment = (
            AssessmentService.get_assessment_by_id(
                assessment_id
            )
        )

        # -----------------------------------------------------
        # Instructor ownership
        # -----------------------------------------------------

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

        # -----------------------------------------------------
        # Validate
        # -----------------------------------------------------

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

        # -----------------------------------------------------
        # If instructor changes course offering,
        # verify ownership of the new offering.
        # -----------------------------------------------------

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

        # -----------------------------------------------------
        # Update
        # -----------------------------------------------------

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

        # Only Admin can delete assessment.
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


# ==========================================================
# Assessment Marks
# ==========================================================


class AssessmentMarkListCreateView(APIView):
    """
    GET:
        List assessment marks.

        Admin:
            Can see all marks.

        Instructor:
            Can see marks for their own courses.

        Student:
            Can see only their own marks.

    POST:
        Create a student's mark.

        Admin:
            Can enter marks for any course.

        Instructor:
            Can enter marks only for their own courses.

        Student:
            Cannot enter marks.
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

        student = request.query_params.get(
            "student"
        )

        course_offering = request.query_params.get(
            "course_offering"
        )

        assessment_type = request.query_params.get(
            "assessment_type"
        )

        # =====================================================
        # STUDENT
        # =====================================================

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

            # Force student filter to logged-in student.
            student = request.user.student_profile.id

        # =====================================================
        # Get marks
        # =====================================================

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

        # =====================================================
        # INSTRUCTOR
        # =====================================================

        if (
            request.user.role == "INSTRUCTOR"
            and not request.user.is_staff
        ):
            marks = marks.filter(
                assessment__course_offering__instructor__user=(
                    request.user
                )
            )

        # =====================================================
        # PAGINATION
        # =====================================================

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
                        "Students cannot enter "
                        "assessment marks."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # -----------------------------------------------------
        # Validate
        # -----------------------------------------------------

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

        # -----------------------------------------------------
        # Instructor ownership
        # -----------------------------------------------------

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

        # -----------------------------------------------------
        # Create mark
        # -----------------------------------------------------

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
        Retrieve a student's assessment mark.

    PUT:
        Update a mark.

    PATCH:
        Partially update a mark.

    DELETE:
        Soft delete a mark.

    Admin:
        Full access.

    Instructor:
        Can manage marks for their own courses.

    Student:
        Can only view their own marks.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, mark_id):

        mark = (
            AssessmentService
            .get_assessment_mark_by_id(mark_id)
        )

        # =====================================================
        # STUDENT
        # =====================================================

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

        # =====================================================
        # INSTRUCTOR
        # =====================================================

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
                        "Students cannot update "
                        "assessment marks."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # -----------------------------------------------------
        # Get mark
        # -----------------------------------------------------

        mark = (
            AssessmentService
            .get_assessment_mark_by_id(mark_id)
        )

        # -----------------------------------------------------
        # Instructor ownership
        # -----------------------------------------------------

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

        # -----------------------------------------------------
        # Validate
        # -----------------------------------------------------

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

        # -----------------------------------------------------
        # If assessment is changed, make sure the
        # instructor owns the new assessment.
        # -----------------------------------------------------

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

        # -----------------------------------------------------
        # Update
        # -----------------------------------------------------

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

        # Only Admin can delete marks.
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