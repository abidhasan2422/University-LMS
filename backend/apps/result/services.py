
from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework.exceptions import ValidationError

from apps.assessment.models import Assessment, AssessmentMark
from apps.attendance.models import Attendance
from apps.enrollments.models import Enrollment

from .models import Result


class ResultService:
    """
    Service layer for calculating and managing student results.

    Final marks:
        Attendance = 10 marks
        Assessments = 90 marks
        Total = 100 marks
    """

    ATTENDANCE_MAX_MARKS = Decimal("10")
    ASSESSMENT_MAX_MARKS = Decimal("90")
    TOTAL_MAX_MARKS = Decimal("100")

    # ---------------------------------------------------------
    # Helper
    # ---------------------------------------------------------

    @staticmethod
    def round_value(value):
        return Decimal(value).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

    @staticmethod
    def get_course_credit(course):
        """
        Support either `credit` or `credits` as the Course field.
        """

        credit = getattr(course, "credit", None)

        if credit is None:
            credit = getattr(course, "credits", None)

        if credit is None:
            raise ValidationError(
                "Course credit field was not found. "
                "Check your Course model."
            )

        credit = Decimal(str(credit))

        if credit <= 0:
            raise ValidationError(
                "Course credit must be greater than zero."
            )

        return credit

    # ---------------------------------------------------------
    # Grade Calculation
    # ---------------------------------------------------------

    @staticmethod
    def calculate_grade(total_marks):
        """
        Grading scale:

            80 - 100 = A+ / 4.00
            75 - 79  = A  / 3.75
            70 - 74  = A- / 3.50
            65 - 69  = B+ / 3.25
            60 - 64  = B  / 3.00
            55 - 59  = B- / 2.75
            50 - 54  = C+ / 2.50
            45 - 49  = C  / 2.25
            40 - 44  = D  / 2.00
            Below 40 = F  / 0.00
        """

        total_marks = Decimal(str(total_marks))

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
    # Enrollment Validation
    # ---------------------------------------------------------

    @staticmethod
    def validate_enrollment(enrollment):
        """
        Only active ENROLLED or COMPLETED enrollments
        can have results.
        """

        if not enrollment.is_active:
            raise ValidationError({
                "enrollment": "This enrollment is inactive."
            })

        allowed_statuses = [
            Enrollment.Status.ENROLLED,
            Enrollment.Status.COMPLETED,
        ]

        if enrollment.status not in allowed_statuses:
            raise ValidationError({
                "enrollment": (
                    "A result can only be generated for "
                    "an enrolled or completed student."
                )
            })

    # ---------------------------------------------------------
    # Attendance Calculation
    # ---------------------------------------------------------

    @staticmethod
    def calculate_attendance_percentage(enrollment):
        """
        Calculate attendance percentage.

        PRESENT = attended
        ABSENT = missed
        """

        attendance_records = Attendance.objects.filter(
            enrollment=enrollment,
            is_active=True,
        )

        total_classes = attendance_records.count()

        if total_classes == 0:
            return Decimal("0.00")

        present_classes = attendance_records.filter(
            status=Attendance.Status.PRESENT,
        ).count()

        percentage = (
            Decimal(present_classes)
            / Decimal(total_classes)
        ) * Decimal("100")

        return ResultService.round_value(percentage)

    @staticmethod
    def calculate_attendance_marks(enrollment):
        """
        Convert attendance percentage into 10 marks.
        """

        percentage = (
            ResultService.calculate_attendance_percentage(
                enrollment
            )
        )

        marks = (
            percentage
            * ResultService.ATTENDANCE_MAX_MARKS
            / Decimal("100")
        )

        return ResultService.round_value(marks)

    # ---------------------------------------------------------
    # Assessment Calculation
    # ---------------------------------------------------------

    @staticmethod
    def calculate_assessment_marks(enrollment):
        """
        Calculate assessment marks scaled to 90.

        Every active assessment belonging to the student's
        course offering must have an active mark entry.

        This prevents generating misleading results when
        some assessments have not yet been graded.
        """

        course_offering = enrollment.course_offering

        assessments = Assessment.objects.filter(
            course_offering=course_offering,
            is_active=True,
        )

        assessment_ids = set(
            assessments.values_list("id", flat=True)
        )

        if not assessment_ids:
            raise ValidationError({
                "assessment": (
                    "No active assessments are configured "
                    "for this course offering."
                )
            })

        marks = AssessmentMark.objects.filter(
            enrollment=enrollment,
            assessment_id__in=assessment_ids,
            is_active=True,
        ).select_related("assessment")

        marks_by_assessment = {
            mark.assessment_id: mark
            for mark in marks
        }

        missing_assessments = (
            assessment_ids - set(marks_by_assessment.keys())
        )

        if missing_assessments:
            raise ValidationError({
                "assessment": (
                    f"{len(missing_assessments)} assessment(s) "
                    "have not been graded for this student."
                )
            })

        total_obtained = Decimal("0.00")
        total_maximum = Decimal("0.00")

        for mark in marks_by_assessment.values():

            obtained = Decimal(str(mark.obtained_marks))
            maximum = Decimal(
                str(mark.assessment.maximum_marks)
            )

            if maximum <= 0:
                raise ValidationError({
                    "assessment": (
                        "Assessment maximum marks must be "
                        "greater than zero."
                    )
                })

            if obtained < 0 or obtained > maximum:
                raise ValidationError({
                    "assessment": (
                        "An assessment mark is outside its "
                        "allowed range."
                    )
                })

            total_obtained += obtained
            total_maximum += maximum

        if total_maximum <= 0:
            raise ValidationError({
                "assessment": "Invalid assessment maximum marks."
            })

        assessment_marks = (
            total_obtained
            * ResultService.ASSESSMENT_MAX_MARKS
            / total_maximum
        )

        return ResultService.round_value(assessment_marks)

    # ---------------------------------------------------------
    # Total Result Calculation
    # ---------------------------------------------------------

    @staticmethod
    def calculate_total_marks(enrollment):
        """
        Calculate final marks out of 100.

        Attendance = 10
        Assessments = 90
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

        total_marks = attendance_marks + assessment_marks

        total_marks = min(
            total_marks,
            ResultService.TOTAL_MAX_MARKS,
        )

        return ResultService.round_value(total_marks)

    # ---------------------------------------------------------
    # Generate Result
    # ---------------------------------------------------------

    @staticmethod
    @transaction.atomic
    def generate_result(enrollment):
        """
        Calculate and create/update a student's result.

        Existing soft-deleted results are restored instead
        of creating duplicate OneToOne records.

        Regenerating a result unpublishes it because its
        calculated marks may have changed.
        """

        enrollment = Enrollment.objects.select_for_update().get(
            pk=enrollment.pk
        )

        ResultService.validate_enrollment(enrollment)

        total_marks = ResultService.calculate_total_marks(
            enrollment
        )

        percentage = total_marks

        letter_grade, grade_point = (
            ResultService.calculate_grade(total_marks)
        )

        result_status = (
            Result.ResultStatus.PASS
            if letter_grade != "F"
            else Result.ResultStatus.FAIL
        )

        result = (
            Result.all_objects
            .select_for_update()
            .filter(enrollment=enrollment)
            .first()
        )

        if result:
            result.total_marks = total_marks
            result.percentage = percentage
            result.letter_grade = letter_grade
            result.grade_point = grade_point
            result.status = result_status

            # Recalculation invalidates the previous publication.
            result.is_published = False
            result.published_at = None

            if not result.is_active:
                result.restore()

            result.save()

        else:
            result = Result.objects.create(
                enrollment=enrollment,
                total_marks=total_marks,
                percentage=percentage,
                letter_grade=letter_grade,
                grade_point=grade_point,
                status=result_status,
            )

        return result

    # ---------------------------------------------------------
    # Retrieve Result
    # ---------------------------------------------------------

    @staticmethod
    def get_result_by_id(result_id):
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

    @staticmethod
    def get_result_by_enrollment(enrollment):
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
        Return active results with optional filters.
        """

        queryset = Result.objects.select_related(
            "enrollment",
            "enrollment__student",
            "enrollment__student__user",
            "enrollment__course_offering",
            "enrollment__course_offering__course",
            "enrollment__course_offering__semester",
            "enrollment__course_offering__instructor",
        )

        filters = {}

        if student:
            filters["enrollment__student_id"] = student

        if course_offering:
            filters["enrollment__course_offering_id"] = (
                course_offering
            )

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

        return queryset.filter(**filters).order_by("-created_at")

    # ---------------------------------------------------------
    # Publish Result
    # ---------------------------------------------------------

    @staticmethod
    @transaction.atomic
    def publish_result(result):
        """
        Publish a result.

        Preserve the original publication timestamp if
        the result is already published.
        """

        if not result.is_published:
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
    @transaction.atomic
    def unpublish_result(result):
        """
        Unpublish a result.
        """

        if result.is_published:
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

    # ---------------------------------------------------------
    # Semester GPA
    # ---------------------------------------------------------

    @staticmethod
    def calculate_semester_gpa(
        student_id,
        semester_id,
        academic_year=None,
    ):
        """
        Calculate credit-weighted GPA for a student
        in a specific semester.

        Only published results are included.
        """

        filters = {
            "enrollment__student_id": student_id,
            "enrollment__course_offering__semester_id": semester_id,
            "is_published": True,
        }

        if academic_year:
            filters[
                "enrollment__course_offering__academic_year"
            ] = academic_year

        results = Result.objects.filter(
            **filters
        ).select_related(
            "enrollment__course_offering__course",
        )

        total_quality_points = Decimal("0.00")
        total_credits = Decimal("0.00")
        courses = []

        for result in results:

            course = result.enrollment.course_offering.course

            credit = ResultService.get_course_credit(course)

            grade_point = Decimal(str(result.grade_point))

            quality_points = grade_point * credit

            total_quality_points += quality_points
            total_credits += credit

            courses.append({
                "course_code": course.course_code,
                "course_title": course.course_title,
                "credit": credit,
                "grade": result.letter_grade,
                "grade_point": grade_point,
                "total_marks": result.total_marks,
            })

        if total_credits == 0:
            semester_gpa = Decimal("0.00")
        else:
            semester_gpa = ResultService.round_value(
                total_quality_points / total_credits
            )

        return {
            "semester_gpa": semester_gpa,
            "total_credits": total_credits,
            "courses": courses,
        }

    # ---------------------------------------------------------
    # CGPA
    # ---------------------------------------------------------

    @staticmethod
    def calculate_cgpa(student_id):
        """
        Calculate cumulative GPA across all published results.
        """

        results = Result.objects.filter(
            enrollment__student_id=student_id,
            is_published=True,
        ).select_related(
            "enrollment__course_offering__course",
        )

        total_quality_points = Decimal("0.00")
        total_credits = Decimal("0.00")

        for result in results:

            course = result.enrollment.course_offering.course

            credit = ResultService.get_course_credit(course)

            grade_point = Decimal(str(result.grade_point))

            total_quality_points += grade_point * credit
            total_credits += credit

        if total_credits == 0:
            cgpa = Decimal("0.00")
        else:
            cgpa = ResultService.round_value(
                total_quality_points / total_credits
            )

        return {
            "cgpa": cgpa,
            "total_credits": total_credits,
        }
