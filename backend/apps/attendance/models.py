from django.db import models

from apps.common.models import BaseModel
from apps.enrollments.models import Enrollment


class Attendance(BaseModel):
    """
    Attendance record for a student's enrollment.
    """

    class Status(models.TextChoices):
        PRESENT = "PRESENT", "Present"
        ABSENT = "ABSENT", "Absent"

    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.PROTECT,
        related_name="attendance_records",
    )

    date = models.DateField()

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
    )

    remarks = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = "attendance"

        ordering = [
            "-date",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "enrollment",
                    "date",
                ],
                name="unique_enrollment_attendance_date",
            )
        ]

        verbose_name = "Attendance"
        verbose_name_plural = "Attendance Records"

    def __str__(self):
        return (
            f"{self.enrollment.student.student_id} - "
            f"{self.enrollment.course_offering.course.course_code} - "
            f"{self.date} - "
            f"{self.status}"
        )