from django.urls import path

from .views import (
    ResultListCreateView,
    ResultDetailView,
    ResultPublishView,
    CGPAView,
    SemesterGPAView,
)

urlpatterns = [
    # List and generate results
    path(
        "",
        ResultListCreateView.as_view(),
        name="result-list-create",
    ),

    # Single result
    path(
        "<int:result_id>/",
        ResultDetailView.as_view(),
        name="result-detail",
    ),

    # Publish / unpublish result
    path(
        "<int:result_id>/publish/",
        ResultPublishView.as_view(),
        name="result-publish",
    ),
    # GPA
    path(
        "gpa/semester/",
        SemesterGPAView.as_view(),
        name="semester-gpa",
    ),
       path(
        "gpa/cgpa/",
        CGPAView.as_view(),
        name="cgpa",
    ),
]