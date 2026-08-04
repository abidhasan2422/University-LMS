from django.conf import settings
from django.db import models

from apps.common.models import BaseModel
from apps.departments.models import Department
from apps.semester.models import Semester


class Student(BaseModel):
    """
    Student model.
    """
    class AdmissionStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
    class Gender(models.TextChoices):
        MALE = "MALE", "Male"
        FEMALE = "FEMALE", "Female"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        GRADUATED = "GRADUATED", "Graduated"
        SUSPENDED = "SUSPENDED", "Suspended"
        DROPPED = "DROPPED", "Dropped"

    class BloodGroup(models.TextChoices):
        A_POSITIVE = "A+", "A+"
        A_NEGATIVE = "A-", "A-"
        B_POSITIVE = "B+", "B+"
        B_NEGATIVE = "B-", "B-"
        AB_POSITIVE = "AB+", "AB+"
        AB_NEGATIVE = "AB-", "AB-"
        O_POSITIVE = "O+", "O+"
        O_NEGATIVE = "O-", "O-"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
    )

    student_id = models.CharField(
    max_length=20,
    unique=True,
    blank=True,
    null=True,
)

    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name="students",
    )

    semester = models.ForeignKey(
        Semester,
        on_delete=models.PROTECT,
        related_name="students",
    )

    admission_year = models.PositiveIntegerField()

    session = models.CharField(
        max_length=20,
    )

    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
    )

    date_of_birth = models.DateField()

    blood_group = models.CharField(
        max_length=5,
        choices=BloodGroup.choices,
        blank=True,
        null=True,
    )

    profile_picture = models.ImageField(
        upload_to="students/",
        blank=True,
        null=True,
    )

    present_address = models.TextField()

    permanent_address = models.TextField()

    guardian_name = models.CharField(
        max_length=150,
    )

    guardian_phone = models.CharField(
        max_length=20,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    admission_status = models.CharField(
    max_length=20,
    choices=AdmissionStatus.choices,
    default=AdmissionStatus.PENDING,
)

    class Meta:
        db_table = "students"
        ordering = ["student_id"]
        verbose_name = "Student"
        verbose_name_plural = "Students"

    def __str__(self):
        return f"{self.student_id} - {self.user.get_full_name()}"