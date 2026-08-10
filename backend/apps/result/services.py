from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError

from apps.assessment.models import AssessmentMark
from apps.attendance.models import Attendance
from apps.enrollment.models import Enrollment

from .models import Result


class ResultService:
    """
    Service layer for calculating and managing student results.
    """

    ATTENDANCE_MAX_MARKS = Decimal("10")
    ASSESSMENT_MAX_MARKS = Decimal("90")
    TOTAL_MAX_MARKS = Decimal("100")

    # ---------------------------------------------------------
    # Grade Calculation
    # ---------------------------------------------------------

    @staticmethod
    def calculate_grade(total_marks):
        """
        Calculate letter grade and grade point.

        Current grading scale:
            80 - 100  = A+ / 4.00
            75 - 79   = A  / 3.75
            70 - 74   = A- / 3.50
            65 - 69   = B+ / 3.25
            60 - 64   = B  / 3.00
            55 - 59   = B- / 2.75
            50 - 54   = C+ / 2.50
            45 - 49   = C  / 2.25
            40 - 44   = D  / 2.00
            Below 40  = F  / 0.00
        """

        total_marks = Decimal(total_marks)

        if total_marks >= Decimal("80"):
            return "A+", Decimal("4.00")

        if total_marks >= Decimal("75"):
            return "A", Decimal("3.75")

        if total_marks >= Decimal("70"):
            return "A-", Decimal("3.50")

        if total_marks >= Decimal("65"):
            return "B+", Decimal("3.25")

        if total_marks >= Decimal("60"):
            return "B", Decimal("3.00")

        if total_marks >= Decimal("55"):
            return "B-", Decimal("2.75")

        if total_marks >= Decimal("50"):
            return "C+", Decimal("2.50")

        if total_marks >= Decimal("45"):
            return "C", Decimal("2.25")

        if total_marks >= Decimal("40"):
            return "D", Decimal("2.00")

        return "F", Decimal("0.00")

    # ---------------------------------------------------------
    # Attendance Calculation
    # ---------------------------------------------------------

    @staticmethod
    def calculate_attendance_percentage(enrollment):
        """
        Calculate attendance percentage for an enrollment.

        PRESENT records are counted as attended.
        ABSENT records are counted as missed.
        """

        total_classes = Attendance.objects.filter(
            enrollment=enrollment,
            is_active=True,
        ).count()

        if total_classes == 0:
            return Decimal("0.00")

        present_classes = Attendance.objects.filter(
            enrollment=enrollment,
            status=Attendance.Status.PRESENT,
            is_active=True,
        ).count()

        percentage = (
            Decimal(present_classes)
            / Decimal(total_classes)
        ) * Decimal("100")

        return percentage.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

    @staticmethod
    def calculate_attendance_marks(enrollment):
        """
        Convert attendance percentage into 10 marks.
        """

        attendance_percentage = (
            ResultService.calculate_attendance_percentage(
                enrollment
            )
        )

        attendance_marks = (
            attendance_percentage
            * ResultService.ATTENDANCE_MAX_MARKS
            / Decimal("100")
        )

        return attendance_marks.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

    # ---------------------------------------------------------
    # Assessment Calculation
    # ---------------------------------------------------------

    @staticmethod
    def calculate_assessment_marks(enrollment):
        """
        Calculate assessment marks for an enrollment.

        The assessment components together represent
        90 marks of the final 100 marks.

        Example:

            Assignment = 8/10
            Quiz       = 9/10
            Mid        = 17/20
            Final      = 35/40

            Obtained = 69
            Maximum  = 80

        The result is scaled to 90 marks:

            69 / 80 * 90 = 77.625
        """

        marks = AssessmentMark.objects.filter(
            enrollment=enrollment,
            is_active=True,
        ).select_related(
            "assessment",
        )

        total_obtained = Decimal("0")
        total_maximum = Decimal("0")

        for mark in marks:
            total_obtained += Decimal(
                mark.obtained_marks
            )

            total_maximum += Decimal(
                mark.assessment.maximum_marks
            )

        # No assessment marks entered yet.
        if total_maximum == 0:
            return Decimal("0.00")

        assessment_marks = (
            total_obtained
            * ResultService.ASSESSMENT_MAX_MARKS
            / total_maximum
        )

        return assessment_marks.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

    # ---------------------------------------------------------
    # Total Result Calculation
    # ---------------------------------------------------------

    @staticmethod
    def calculate_total_marks(enrollment):
        """
        Calculate final marks out of 100.

        10 marks  -> Attendance
        90 marks  -> Assessments
        """

        attendance_marks = (
            ResultService.calculate_attendance_marks(
                enrollment
            )
        )

        assessment_marks = (
            ResultService.calculate_assessment_marks(
                enrollment
            )
        )

        total_marks = (
            attendance_marks
            + assessment_marks
        )

        # Make sure total never exceeds 100.
        total_marks = min(
            total_marks,
            ResultService.TOTAL_MAX_MARKS,
        )

        return total_marks.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

    # ---------------------------------------------------------
    # Create / Generate Result
    # ---------------------------------------------------------

    @staticmethod
    @transaction.atomic
    def generate_result(enrollment):
        """
        Calculate and create/update a student's result.
        """

        # -----------------------------------------------------
        # Validate enrollment
        # -----------------------------------------------------

        if not enrollment.is_active:
            raise ValidationError(
                {
                    "enrollment": (
                        "This enrollment is inactive."
                    )
                }
            )

        if enrollment.status != Enrollment.Status.ENROLLED:
            raise ValidationError(
                {
                    "enrollment": (
                        "Result can only be generated "
                        "for an enrolled student."
                    )
                }
            )

        # -----------------------------------------------------
        # Calculate marks
        # -----------------------------------------------------

        total_marks = (
            ResultService.calculate_total_marks(
                enrollment
            )
        )

        percentage = total_marks

        letter_grade, grade_point = (
            ResultService.calculate_grade(
                total_marks
            )
        )

        if letter_grade == "F":
            result_status = Result.ResultStatus.FAIL
        else:
            result_status = Result.ResultStatus.PASS

        # -----------------------------------------------------
        # Create or update result
        # -----------------------------------------------------

        result, created = Result.objects.update_or_create(
            enrollment=enrollment,
            defaults={
                "total_marks": total_marks,
                "percentage": percentage,
                "letter_grade": letter_grade,
                "grade_point": grade_point,
                "status": result_status,
            },
        )

        return result

    # ---------------------------------------------------------
    # Retrieve Result
    # ---------------------------------------------------------

    @staticmethod
    def get_result_by_id(result_id):
        """
        Return a single result.
        """

        return get_object_or_404(
            Result.objects.select_related(
                "enrollment",
                "enrollment__student",
                "enrollment__student__user",
                "enrollment__course_offering",
                "enrollment__course_offering__course",
                "enrollment__course_offering__semester",
            ),
            id=result_id,
        )

    # ---------------------------------------------------------
    # Get Student Result
    # ---------------------------------------------------------

    @staticmethod
    def get_result_by_enrollment(enrollment):
        """
        Return result for a specific enrollment.
        """

        return get_object_or_404(
            Result.objects.select_related(
                "enrollment",
                "enrollment__student",
                "enrollment__student__user",
                "enrollment__course_offering",
                "enrollment__course_offering__course",
                "enrollment__course_offering__semester",
            ),
            enrollment=enrollment,
        )

    # ---------------------------------------------------------
    # List Results
    # ---------------------------------------------------------

    @staticmethod
    def get_all_results(
        student=None,
        course_offering=None,
        semester=None,
        academic_year=None,
        status=None,
        is_published=None,
    ):
        """
        Return results with filtering.
        """

        queryset = Result.objects.select_related(
            "enrollment",
            "enrollment__student",
            "enrollment__student__user",
            "enrollment__course_offering",
            "enrollment__course_offering__course",
            "enrollment__course_offering__semester",
        )

        filters = {}

        if student:
            filters[
                "enrollment__student_id"
            ] = student

        if course_offering:
            filters[
                "enrollment__course_offering_id"
            ] = course_offering

        if semester:
            filters[
                "enrollment__course_offering__semester_id"
            ] = semester

        if academic_year:
            filters[
                "enrollment__course_offering__academic_year"
            ] = academic_year

        if status:
            filters["status"] = status

        if is_published is not None:
            filters["is_published"] = is_published

        return queryset.filter(**filters)

    # ---------------------------------------------------------
    # Publish Result
    # ---------------------------------------------------------

    @staticmethod
    def publish_result(result):
        """
        Publish a result so the student can view it.
        """

        from django.utils import timezone

        result.is_published = True
        result.published_at = timezone.now()

        result.save(
            update_fields=[
                "is_published",
                "published_at",
                "updated_at",
            ]
        )

        return result

    # ---------------------------------------------------------
    # Unpublish Result
    # ---------------------------------------------------------

    @staticmethod
    def unpublish_result(result):
        """
        Hide a published result from students.
        """

        result.is_published = False
        result.published_at = None

        result.save(
            update_fields=[
                "is_published",
                "published_at",
                "updated_at",
            ]
        )

        return result