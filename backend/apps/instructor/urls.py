from django.urls import path

from .views import (
    InstructorListCreateView,
    InstructorDetailView,
)

urlpatterns = [
    path(
        "",
        InstructorListCreateView.as_view(),
        name="instructor-list-create",
    ),

    path(
        "<int:instructor_id>/",
        InstructorDetailView.as_view(),
        name="instructor-detail",
    ),
]