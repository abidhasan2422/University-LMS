from django.core.validators import MinValueValidator
from django.db import models

from apps.common.models import BaseModel
from apps.course_offering.models import CourseOffering
from apps.enrollments.models import Enrollment


class Assessment(BaseModel):
    """
    Represents an assessment component for a course offering.
    """

    class AssessmentType(models.TextChoices):
        ASSIGNMENT = "ASSIGNMENT", "Assignment"
        QUIZ = "QUIZ", "Quiz"
        PRESENTATION = "PRESENTATION", "Presentation"
        MID = "MID", "Mid"
        FINAL = "FINAL", "Final"

        LAB_PERFORMANCE = (
            "LAB_PERFORMANCE",
            "Lab Performance",
        )
        LAB_VIVA = (
            "LAB_VIVA",
            "Lab Viva",
        )
        LAB_FINAL = (
            "LAB_FINAL",
            "Lab Final",
        )

    course_offering = models.ForeignKey(
        CourseOffering,
        on_delete=models.PROTECT,
        related_name="assessments",
    )

    title = models.CharField(
        max_length=150,
    )

    assessment_type = models.CharField(
        max_length=30,
        choices=AssessmentType.choices,
    )

    maximum_marks = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(0),
        ],
    )

    assessment_date = models.DateField(
        null=True,
        blank=True,
    )

    class Meta:
        db_table = "assessments"

        ordering = [
            "assessment_date",
            "created_at",
        ]

        verbose_name = "Assessment"
        verbose_name_plural = "Assessments"

    def __str__(self):
        return (
            f"{self.course_offering.course.course_code} - "
            f"{self.title}"
        )


class AssessmentMark(BaseModel):
    """
    Stores marks obtained by a student for an assessment.
    """

    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.PROTECT,
        related_name="marks",
    )

    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.PROTECT,
        related_name="assessment_marks",
    )

    obtained_marks = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(0),
        ],
    )

    remarks = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = "assessment_marks"

        ordering = [
            "assessment",
            "enrollment",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "assessment",
                    "enrollment",
                ],
                name="unique_assessment_enrollment",
            )
        ]

        verbose_name = "Assessment Mark"
        verbose_name_plural = "Assessment Marks"

    def __str__(self):
        return (
            f"{self.enrollment.student.student_id} - "
            f"{self.assessment.title} - "
            f"{self.obtained_marks}"
        )