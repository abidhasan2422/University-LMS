from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from apps.common.query_service import QueryService
from apps.student.models import Student
from .models import Enrollment


class EnrollmentService:
    """
    Service layer for handling Enrollment business rules and validations.
    """

    @staticmethod
    def validate_student_schedule_conflict(student, course_offering):
        """
        Prevent a student from enrolling in two classes at the exact same day and time.
        """
        conflicting_enrollment = Enrollment.objects.filter(
            student=student,
            status=Enrollment.Status.ENROLLED,
            is_active=True,
            course_offering__day=course_offering.day,
            course_offering__semester=course_offering.semester,
            course_offering__academic_year=course_offering.academic_year,
        ).filter(
            course_offering__start_time__lt=course_offering.end_time,
            course_offering__end_time__gt=course_offering.start_time,
        ).exists()

        if conflicting_enrollment:
            raise ValidationError(
                {
                    "schedule": (
                        "You are already enrolled in another course section "
                        "that conflicts with this time slot."
                    )
                }
            )

    @staticmethod
    def validate_course_capacity(course_offering):
        """
        Ensure the course offering is open and hasn't reached maximum capacity.
        """
        if course_offering.status != "OPEN":
            raise ValidationError(
                {"course_offering": "This course offering is closed for enrollment."}
            )

        current_enrollments_count = Enrollment.objects.filter(
            course_offering=course_offering,
            status=Enrollment.Status.ENROLLED,
            is_active=True,
        ).count()

        if current_enrollments_count >= course_offering.capacity:
            raise ValidationError(
                {"capacity": "This course offering has reached full capacity."}
            )

    @staticmethod
    @transaction.atomic
    def enroll_student(serializer):
        """
        Execute student enrollment with full validation checks and transaction safety.
        """
        data = serializer.validated_data
        student = data["student"]
        course_offering = data["course_offering"]

        # 1. Verify student admission status
        if student.admission_status != Student.AdmissionStatus.APPROVED:
            raise ValidationError(
                {"student": "Only students with approved admissions can enroll in courses."}
            )

        # 2. Check capacity & open status
        EnrollmentService.validate_course_capacity(course_offering)

        # 3. Check time overlaps / schedule conflicts
        EnrollmentService.validate_student_schedule_conflict(student, course_offering)

        return serializer.save(status=Enrollment.Status.ENROLLED)

    @staticmethod
    def get_all_enrollments(search=None, ordering=None, student=None, course_offering=None, status=None):
        queryset = Enrollment.objects.select_related(
            "student",
            "student__user",
            "course_offering",
            "course_offering__course",
            "course_offering__semester",
        )
        return QueryService.apply(
            queryset=queryset,
            search=search,
            search_fields=[
                "student__student_id",
                "student__user__first_name",
                "student__user__last_name",
                "course_offering__course__course_code",
                "course_offering__course__course_title",
            ],
            ordering=ordering,
            allowed_ordering=[
                "-enrollment_date",
                "enrollment_date",
                "status",
            ],
            filters={
                "student_id": student,
                "course_offering_id": course_offering,
                "status": status,
            },
        )

    @staticmethod
    def drop_enrollment(enrollment):
        """
        Mark an enrollment as dropped.
        """
        enrollment.status = Enrollment.Status.DROPPED
        enrollment.save(update_fields=["status", "updated_at"])
        return enrollment