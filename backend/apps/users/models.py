from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

from .managers import CustomUserManager


class UserRole(models.TextChoices):
    ADMIN = "ADMIN", "Admin"
    INSTRUCTOR = "INSTRUCTOR", "Instructor"
    STUDENT = "STUDENT", "Student"


class AccountStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    ACTIVE = "ACTIVE", "Active"
    REJECTED = "REJECTED", "Rejected"
    SUSPENDED = "SUSPENDED", "Suspended"


class User(AbstractBaseUser, PermissionsMixin):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    email = models.EmailField(
        unique=True,
        db_index=True,
    )

    phone_number = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
    )

    
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.STUDENT,
    )

    status = models.CharField(
        max_length=20,
        choices=AccountStatus.choices,
        default=AccountStatus.PENDING,
    )


    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

   
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

   
    objects = CustomUserManager()

   
    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = [
        "first_name",
        "last_name",
        "phone_number",
    ]


    class Meta:
        ordering = ["-created_at"]
        verbose_name = "User"
        verbose_name_plural = "Users"

   
    def __str__(self):
        return f"{self.email} ({self.role})"