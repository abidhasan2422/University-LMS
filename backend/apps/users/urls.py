
from django.urls import path

from .views import (
    ProfileView,
    ChangePasswordView,
)

urlpatterns = [
    path(
        "profile/",
        ProfileView.as_view(),
        name="admin-profile",
    ),
    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="admin-change-password",
    ),
]
