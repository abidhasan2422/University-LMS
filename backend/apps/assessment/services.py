from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError

from apps.common.query_service import QueryService

from .models import Assessment, AssessmentMark


class AssessmentService:
    """
    Service layer for Assessment business logic.
    """

    # ---------------------------------------------------------
    # Assessment
    # ---------------------------------------------------------

    @staticmethod
    def create_assessment(serializer):
        """
        Create a new assessment.
        """

        return serializer.save()

    @staticmethod
    def get_all_assessments(
        search=None,
        ordering=None,
        course_offering=None,
        assessment_type=None,
        is_active=True,
    ):
        """
        Return assessments with search,
        filtering and ordering.
        """

        queryset = Assessment.objects.select_related(
            "course_offering",
            "course_offering__course",
            "course_offering__instructor",
            "course_offering__instructor__user",
            "course_offering__semester",
        )

        return QueryService.apply(
            queryset=queryset,
            search=search,
            search_fields=[
                "title",
                "course_offering__course__course_code",
                "course_offering__course__course_title",
                "course_offering__instructor__employee_id",
                "course_offering__instructor__user__first_name",
                "course_offering__instructor__user__last_name",
            ],
            ordering=ordering,
            allowed_ordering=[
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
            ],
            filters={
                "course_offering_id": course_offering,
                "assessment_type": assessment_type,
                "is_active": is_active,
            },
        )

    @staticmethod
    def get_assessment_by_id(assessment_id):
        """
        Return a single assessment.
        """

        return get_object_or_404(
            Assessment.objects.select_related(
                "course_offering",
                "course_offering__course",
                "course_offering__instructor",
                "course_offering__instructor__user",
                "course_offering__semester",
            ),
            id=assessment_id,
        )

    @staticmethod
    def update_assessment(serializer):
        """
        Update an assessment.
        """

        return serializer.save()

    @staticmethod
    def delete_assessment(assessment):
        """
        Soft delete an assessment.
        """

        assessment.soft_delete()

        return assessment

    @staticmethod
    def restore_assessment(assessment):
        """
        Restore a deleted assessment.
        """

        assessment.restore()

        return assessment

    @staticmethod
    def get_deleted_assessments():
        """
        Return deleted assessments.
        """

        return (
            Assessment.all_objects.filter(
                is_active=False
            )
            .select_related(
                "course_offering",
                "course_offering__course",
                "course_offering__instructor",
                "course_offering__instructor__user",
                "course_offering__semester",
            )
        )

    # ---------------------------------------------------------
    # Assessment Marks
    # ---------------------------------------------------------

    @staticmethod
    def create_assessment_mark(serializer):
        """
        Create a student's assessment mark.

        Duplicate assessment marks are prevented by
        the database constraint and checked here
        for a cleaner API response.
        """

        data = serializer.validated_data

        assessment = data["assessment"]
        enrollment = data["enrollment"]

        existing_mark = AssessmentMark.objects.filter(
            assessment=assessment,
            enrollment=enrollment,
            is_active=True,
        ).exists()

        if existing_mark:
            raise ValidationError(
                {
                    "assessment": (
                        "This student already has marks "
                        "for this assessment."
                    )
                }
            )

        return serializer.save()

    @staticmethod
    def get_all_assessment_marks(
        search=None,
        ordering=None,
        assessment=None,
        enrollment=None,
        student=None,
        course_offering=None,
        assessment_type=None,
    ):
        """
        Return assessment marks with search,
        filtering and ordering.
        """

        queryset = AssessmentMark.objects.select_related(
            "assessment",
            "assessment__course_offering",
            "assessment__course_offering__course",
            "assessment__course_offering__instructor",
            "assessment__course_offering__instructor__user",
            "assessment__course_offering__semester",
            "enrollment",
            "enrollment__student",
            "enrollment__student__user",
        )

        return QueryService.apply(
            queryset=queryset,
            search=search,
            search_fields=[
                "enrollment__student__student_id",
                "enrollment__student__user__first_name",
                "enrollment__student__user__last_name",
                "enrollment__student__user__email",
                "assessment__title",
                "assessment__course_offering__course__course_code",
                "assessment__course_offering__course__course_title",
            ],
            ordering=ordering,
            allowed_ordering=[
                "obtained_marks",
                "-obtained_marks",
                "created_at",
                "-created_at",
                "assessment__assessment_date",
                "-assessment__assessment_date",
            ],
            filters={
                "assessment_id": assessment,
                "enrollment_id": enrollment,
                "enrollment__student_id": student,
                "assessment__course_offering_id": course_offering,
                "assessment__assessment_type": assessment_type,
            },
        )

    @staticmethod
    def get_assessment_mark_by_id(mark_id):
        """
        Return a single assessment mark.
        """

        return get_object_or_404(
            AssessmentMark.objects.select_related(
                "assessment",
                "assessment__course_offering",
                "assessment__course_offering__course",
                "assessment__course_offering__instructor",
                "assessment__course_offering__instructor__user",
                "assessment__course_offering__semester",
                "enrollment",
                "enrollment__student",
                "enrollment__student__user",
            ),
            id=mark_id,
        )

    @staticmethod
    def update_assessment_mark(serializer):
        """
        Update an assessment mark.
        """

        return serializer.save()

    @staticmethod
    def delete_assessment_mark(mark):
        """
        Soft delete an assessment mark.
        """

        mark.soft_delete()

        return mark

    @staticmethod
    def restore_assessment_mark(mark):
        """
        Restore a deleted assessment mark.
        """

        mark.restore()

        return mark

    @staticmethod
    def get_deleted_assessment_marks():
        """
        Return deleted assessment marks.
        """

        return (
            AssessmentMark.all_objects.filter(
                is_active=False
            )
            .select_related(
                "assessment",
                "assessment__course_offering",
                "assessment__course_offering__course",
                "assessment__course_offering__instructor",
                "assessment__course_offering__instructor__user",
                "assessment__course_offering__semester",
                "enrollment",
                "enrollment__student",
                "enrollment__student__user",
            )
        )