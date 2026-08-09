
from django.urls import path

from .views import (
    AttendanceListCreateView,
    AttendanceDetailView,
    AttendanceSummaryView
)

urlpatterns = [
    path(
        "",
        AttendanceListCreateView.as_view(),
        name="attendance-list-create",
    ),
    path(
        "<int:attendance_id>/",
        AttendanceDetailView.as_view(),
        name="attendance-detail",
    ),
     path(
        "summary/",
        AttendanceSummaryView.as_view(),
        name="attendance-summary",
    ),
]