from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from apps.common.query_service import QueryService
from django.db.models import Count, Q
from .models import Attendance


class AttendanceService:
    """
    Service layer for Attendance business logic.
    """

    @staticmethod
    def validate_attendance(
        enrollment,
        attendance_date,
        exclude_id=None,
    ):
        """
        Validate attendance before creating or updating.
        """

        # Enrollment must be active.
        if not enrollment.is_active:
            raise ValidationError(
                {
                    "enrollment": (
                        "Attendance cannot be recorded for "
                        "an inactive enrollment."
                    )
                }
            )

        # Student must still be enrolled.
        if enrollment.status != "ENROLLED":
            raise ValidationError(
                {
                    "enrollment": (
                        "Attendance can only be recorded for "
                        "an enrolled student."
                    )
                }
            )

        # Prevent duplicate attendance for the same
        # enrollment and date.
        queryset = Attendance.objects.filter(
            enrollment=enrollment,
            date=attendance_date,
            is_active=True,
        )

        if exclude_id:
            queryset = queryset.exclude(id=exclude_id)

        if queryset.exists():
            raise ValidationError(
                {
                    "attendance": (
                        "Attendance has already been recorded "
                        "for this student on this date."
                    )
                }
            )

    @staticmethod
    def create_attendance(serializer):
        """
        Create a new attendance record.
        """

        data = serializer.validated_data

        AttendanceService.validate_attendance(
            enrollment=data["enrollment"],
            attendance_date=data["date"],
        )

        return serializer.save()

    @staticmethod
    def get_all_attendance(
        search=None,
        ordering=None,
        enrollment=None,
        student=None,
        course_offering=None,
        date=None,
        status=None,
    ):
        """
        Return attendance records with search,
        filtering and ordering.
        """

        queryset = Attendance.objects.select_related(
            "enrollment",
            "enrollment__student",
            "enrollment__student__user",
            "enrollment__course_offering",
            "enrollment__course_offering__course",
            "enrollment__course_offering__instructor",
            "enrollment__course_offering__semester",
        )

        return QueryService.apply(
            queryset=queryset,
            search=search,
            search_fields=[
                "enrollment__student__student_id",
                "enrollment__student__user__first_name",
                "enrollment__student__user__last_name",
                "enrollment__student__user__email",
                "enrollment__course_offering__course__course_code",
                "enrollment__course_offering__course__course_title",
            ],
            ordering=ordering,
            allowed_ordering=[
                "date",
                "-date",
                "status",
                "created_at",
                "-created_at",
            ],
            filters={
                "enrollment_id": enrollment,
                "enrollment__student_id": student,
                "enrollment__course_offering_id": course_offering,
                "date": date,
                "status": status,
            },
        )

    @staticmethod
    def get_attendance_by_id(attendance_id):
        """
        Return a single attendance record.
        """

        return get_object_or_404(
            Attendance.objects.select_related(
                "enrollment",
                "enrollment__student",
                "enrollment__student__user",
                "enrollment__course_offering",
                "enrollment__course_offering__course",
                "enrollment__course_offering__semester",
            ),
            id=attendance_id,
        )

    @staticmethod
    def update_attendance(serializer):
        """
        Update an existing attendance record.
        """

        instance = serializer.instance
        data = serializer.validated_data

        enrollment = data.get(
            "enrollment",
            instance.enrollment,
        )

        attendance_date = data.get(
            "date",
            instance.date,
        )

        AttendanceService.validate_attendance(
            enrollment=enrollment,
            attendance_date=attendance_date,
            exclude_id=instance.id,
        )

        return serializer.save()

    @staticmethod
    def delete_attendance(attendance):
        """
        Soft delete an attendance record.
        """

        attendance.soft_delete()

        return attendance

    @staticmethod
    def restore_attendance(attendance):
        """
        Restore a deleted attendance record.
        """

        attendance.restore()

        return attendance

    @staticmethod
    def get_deleted_attendance():
        """
        Return deleted attendance records.
        """

        return (
            Attendance.all_objects.filter(
                is_active=False
            )
            .select_related(
                "enrollment",
                "enrollment__student",
                "enrollment__student__user",
                "enrollment__course_offering",
                "enrollment__course_offering__course",
                "enrollment__course_offering__semester",
            )
        )
    @staticmethod
    def get_student_attendance_summary(
        student,
        course_offering=None,
    ):
        """
        Calculate attendance summary for a student.
        """

        queryset = Attendance.objects.filter(
            enrollment__student=student,
            enrollment__status="ENROLLED",
            is_active=True,
        )

        if course_offering:
            queryset = queryset.filter(
                enrollment__course_offering_id=course_offering
            )

        summary = queryset.aggregate(
            total_classes=Count("id"),
            present=Count(
                "id",
                filter=Q(
                    status=Attendance.Status.PRESENT
                ),
            ),
            absent=Count(
                "id",
                filter=Q(
                    status=Attendance.Status.ABSENT
                ),
            ),
        )

        total_classes = summary["total_classes"] or 0
        present = summary["present"] or 0
        absent = summary["absent"] or 0

        if total_classes > 0:
            percentage = round(
                (present / total_classes) * 100,
                2,
            )
        else:
            percentage = 0.0

        return {
            "total_classes": total_classes,
            "present": present,
            "absent": absent,
            "attendance_percentage": percentage,
        }