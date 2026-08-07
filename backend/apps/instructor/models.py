from django.conf import settings
from django.db import models

from apps.common.models import BaseModel
from apps.departments.models import Department


class Instructor(BaseModel):
    """
    Instructor model.
    """

    class Designation(models.TextChoices):
        LECTURER = "LECTURER", "Lecturer"
        SENIOR_LECTURER = "SENIOR_LECTURER", "Senior Lecturer"
        ASSISTANT_PROFESSOR = "ASSISTANT_PROFESSOR", "Assistant Professor"
        ASSOCIATE_PROFESSOR = "ASSOCIATE_PROFESSOR", "Associate Professor"
        PROFESSOR = "PROFESSOR", "Professor"

    class EmploymentStatus(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        ON_LEAVE = "ON_LEAVE", "On Leave"
        RETIRED = "RETIRED", "Retired"
        RESIGNED = "RESIGNED", "Resigned"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="instructor_profile",
    )

    employee_id = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True,
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name="instructors",
    )

    designation = models.CharField(
        max_length=30,
        choices=Designation.choices,
    )

    qualification = models.CharField(
        max_length=255,
    )

    specialization = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    joining_date = models.DateField()

    experience_years = models.PositiveIntegerField(
        default=0,
    )

    office_phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )

    office_room = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    profile_picture = models.ImageField(
        upload_to="instructors/",
        blank=True,
        null=True,
    )

    employment_status = models.CharField(
        max_length=20,
        choices=EmploymentStatus.choices,
        default=EmploymentStatus.ACTIVE,
    )

    class Meta:
        db_table = "instructors"
        ordering = ["employee_id"]
        verbose_name = "Instructor"
        verbose_name_plural = "Instructors"

    def __str__(self):
        if self.employee_id:
            return f"{self.employee_id} - {self.user.get_full_name()}"

        return self.user.get_full_name()