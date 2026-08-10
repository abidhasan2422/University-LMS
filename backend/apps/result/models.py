from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.common.models import BaseModel
from apps.enrollments.models import Enrollment


class Result(BaseModel):
    """
    Stores the final result of a student for a course offering.
    """

    class ResultStatus(models.TextChoices):
        PASS = "PASS", "Pass"
        FAIL = "FAIL", "Fail"

    enrollment = models.OneToOneField(
        Enrollment,
        on_delete=models.PROTECT,
        related_name="result",
    )

    total_marks = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100),
        ],
    )

    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100),
        ],
    )

    letter_grade = models.CharField(
        max_length=5,
        blank=True,
    )

    grade_point = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        validators=[
            MinValueValidator(0),
        ],
    )

    status = models.CharField(
        max_length=10,
        choices=ResultStatus.choices,
        default=ResultStatus.FAIL,
    )

    is_published = models.BooleanField(
        default=False,
    )

    published_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        db_table = "results"

        ordering = [
            "-created_at",
        ]

        verbose_name = "Result"
        verbose_name_plural = "Results"

    def __str__(self):
        return (
            f"{self.enrollment.student.student_id} - "
            f"{self.enrollment.course_offering.course.course_code}"
        )