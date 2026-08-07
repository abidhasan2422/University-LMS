from django.db import models

from apps.common.models import BaseModel
from apps.course.models import Course
from apps.instructor.models import Instructor
from apps.semester.models import Semester


class CourseOffering(BaseModel):
    """
    Course Offering Model.
    """

    class Day(models.TextChoices):
        SATURDAY = "SATURDAY", "Saturday"
        SUNDAY = "SUNDAY", "Sunday"
        MONDAY = "MONDAY", "Monday"
        TUESDAY = "TUESDAY", "Tuesday"
        WEDNESDAY = "WEDNESDAY", "Wednesday"
        THURSDAY = "THURSDAY", "Thursday"

    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        CLOSED = "CLOSED", "Closed"
        COMPLETED = "COMPLETED", "Completed"

    class Section(models.TextChoices):
        A = "A", "A"
        B = "B", "B"
        C = "C", "C"
        D = "D", "D"

    course = models.ForeignKey(
        Course,
        on_delete=models.PROTECT,
        related_name="course_offerings",
    )

    instructor = models.ForeignKey(
        Instructor,
        on_delete=models.PROTECT,
        related_name="course_offerings",
    )

    semester = models.ForeignKey(
        Semester,
        on_delete=models.PROTECT,
        related_name="course_offerings",
    )

    academic_year = models.PositiveIntegerField()

    section = models.CharField(
        max_length=2,
        choices=Section.choices,
    )

    capacity = models.PositiveIntegerField(
        default=40,
    )

    room = models.CharField(
        max_length=20,
    )

    day = models.CharField(
        max_length=20,
        choices=Day.choices,
    )

    start_time = models.TimeField()

    end_time = models.TimeField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
    )

    class Meta:
        db_table = "course_offerings"
        ordering = [
            "academic_year",
            "semester",
            "course",
        ]
        verbose_name = "Course Offering"
        verbose_name_plural = "Course Offerings"

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "course",
                    "semester",
                    "academic_year",
                    "section",
                ],
                name="unique_course_offering",
            )
        ]
   
    def __str__(self):
        return (
            f"{self.course.course_code} - "
            f"{self.semester.name} "
            f"{self.academic_year} "
            f"Section {self.section}"
        )