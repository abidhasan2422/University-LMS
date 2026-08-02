from django.db import models

from apps.common.models import BaseModel


class Semester(BaseModel):
    """
    Semester model.
    """

    class SemesterName(models.TextChoices):
        SPRING = "SPRING", "Spring"
        SUMMER = "SUMMER", "Summer"
        FALL = "FALL", "Fall"

    name = models.CharField(
        max_length=20,
        choices=SemesterName.choices,
    )

    year = models.PositiveIntegerField()

    start_date = models.DateField()

    end_date = models.DateField()

    class Meta:
        db_table = "semesters"
        ordering = ["-year", "name"]
        verbose_name = "Semester"
        verbose_name_plural = "Semesters"

        constraints = [
            models.UniqueConstraint(
                fields=["name", "year"],
                name="unique_semester_per_year",
            )
        ]

    def __str__(self):
        return f"{self.get_name_display()} {self.year}"