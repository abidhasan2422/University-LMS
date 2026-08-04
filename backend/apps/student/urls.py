from django.urls import path

from .views import (
    StudentListCreateView,
    StudentDetailView,
    PendingStudentListView,
    ApprovedStudentListView,
    GenerateStudentIDView,
    ApproveStudentView,
    RejectStudentView,
)

urlpatterns = [
    # Student CRUD
    path(
        "",
        StudentListCreateView.as_view(),
        name="student-list-create",
    ),

    path(
        "<int:student_id>/",
        StudentDetailView.as_view(),
        name="student-detail",
    ),

    # Admission Workflow
    path(
        "pending/",
        PendingStudentListView.as_view(),
        name="pending-students",
    ),

    path(
        "approved/",
        ApprovedStudentListView.as_view(),
        name="approved-students",
    ),

    path(
        "<int:student_id>/generate-student-id/",
        GenerateStudentIDView.as_view(),
        name="generate-student-id",
    ),

    path(
        "<int:student_id>/approve/",
        ApproveStudentView.as_view(),
        name="approve-student",
    ),

    path(
        "<int:student_id>/reject/",
        RejectStudentView.as_view(),
        name="reject-student",
    ),
]