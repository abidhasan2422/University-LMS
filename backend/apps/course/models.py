from django.db import models

from apps.common.models import BaseModel
from apps.departments.models import Department
from apps.semester.models import Semester


class Course(BaseModel):
    """
    Course model.
    """

    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name="courses",
    )

    semester = models.ForeignKey(
        Semester,
        on_delete=models.PROTECT,
        related_name="courses",
    )

    course_code = models.CharField(
        max_length=20,
        unique=True,
    )

    course_title = models.CharField(
        max_length=255,
    )

    credit = models.DecimalField(
        max_digits=3,
        decimal_places=1,
    )

    description = models.TextField(
        blank=True,
        null=True,
    )

    class Meta:
        db_table = "courses"
        ordering = ["department__name","semester__year","course_code",]
        verbose_name = "Course"
        verbose_name_plural = "Courses"

        constraints = [
            models.UniqueConstraint(
                fields=["department", "semester", "course_code"],
                name="unique_course_per_department_semester",
            )
        ]

    def __str__(self):
        return f"{self.course_code} - {self. course_title}"