from django.urls import path

from .views import (
    AssessmentListCreateView,
    AssessmentDetailView,
    AssessmentMarkListCreateView,
    AssessmentMarkDetailView,
)

urlpatterns = [
    # Assessments
    path(
        "",
        AssessmentListCreateView.as_view(),
        name="assessment-list-create",
    ),
    path(
        "<int:assessment_id>/",
        AssessmentDetailView.as_view(),
        name="assessment-detail",
    ),

    # Assessment Marks
    path(
        "marks/",
        AssessmentMarkListCreateView.as_view(),
        name="assessment-mark-list-create",
    ),
    path(
        "marks/<int:mark_id>/",
        AssessmentMarkDetailView.as_view(),
        name="assessment-mark-detail",
    ),
]