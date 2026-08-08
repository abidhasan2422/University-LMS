from django.urls import path
from .views import CourseOfferingListCreateView, CourseOfferingDetailView

urlpatterns = [
    path(
        "",
        CourseOfferingListCreateView.as_view(),
        name="course-offering-list-create",
    ),
    path(
        "<int:course_offering_id>/",
        CourseOfferingDetailView.as_view(),
        name="course-offering-detail",
    ),
]