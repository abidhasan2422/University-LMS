from django.db import models
from django.core.exceptions import ValidationError
from apps.common.models import BaseModel
from datetime import date
from django.core.validators import MinValueValidator

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

    year = models.PositiveIntegerField(
            validators=[MinValueValidator(2000)]
    )

    start_date = models.DateField()

    end_date = models.DateField()
    def clean(self):
        super().clean()
        if self.start_date >= self.end_date:
            raise ValidationError({
                "end_date": "End date must be after start date."
            })
        current_year = date.today().year

        if self.year > current_year + 5:
            raise ValidationError({
                "year": f"Year cannot be greater than {current_year + 5}."
            })
        
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    class Meta:
        db_table = "semesters"
        ordering = ["-year", "name"]
        verbose_name = "Semester"
        verbose_name_plural = "Semesters"

        constraints = [
            models.UniqueConstraint(
                fields=["name", "year"],
                name="unique_semester_per_year",
            ),
            models.CheckConstraint(
            check=models.Q(start_date__lt=models.F("end_date")),
            name="semester_start_before_end",
    ),
        ]

    def __str__(self):
        return f"{self.get_name_display()} {self.year}"