from django.db import models
from apps.common.models import BaseModel
from apps.student.models import Student
from apps.course_offering.models import CourseOffering

class Enrollment(BaseModel):
    """
    Enrollment model bridging Students and Course Offerings.
    """
    class Status(models.TextChoices):
        ENROLLED = "ENROLLED", "Enrolled"
        DROPPED = "DROPPED", "Dropped"
        COMPLETED = "COMPLETED", "Completed"

    student = models.ForeignKey(
        Student,
        on_delete=models.PROTECT,
        related_name="enrollments",
    )
    course_offering = models.ForeignKey(
        CourseOffering,
        on_delete=models.PROTECT,
        related_name="enrollments",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ENROLLED,
    )
    enrollment_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "enrollments"
        ordering = ["-enrollment_date"]
        verbose_name = "Enrollment"
        verbose_name_plural = "Enrollments"
        constraints = [
            models.UniqueConstraint(
                fields=["student", "course_offering"],
                name="unique_student_course_offering",
            )
        ]

    def __str__(self):
        return f"{self.student.student_id} -> {self.course_offering.course.course_code} ({self.status})"