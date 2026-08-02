from django.urls import path

from .views import (
    SemesterListCreateView,
    SemesterDetailView,
)

urlpatterns = [
    path(
        "",
        SemesterListCreateView.as_view(),
        name="semester-list-create",
    ),

    path(
        "<int:semester_id>/",
        SemesterDetailView.as_view(),
        name="semester-detail",
    ),
]