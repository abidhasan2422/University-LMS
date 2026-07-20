from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "email",
        "first_name",
        "last_name",
        "role",
        "is_active",
        "is_staff",
    )

    search_fields = (
        "email",
        "first_name",
        "last_name",
        "phone_number",
    )

    list_filter = (
        "role",
        "is_active",
        "is_staff",
    )

    ordering = ("id",)