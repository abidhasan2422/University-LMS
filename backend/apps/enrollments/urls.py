from django.urls import path
from .views import EnrollmentListCreateView, EnrollmentDetailView

urlpatterns = [
    path(
        "",
        EnrollmentListCreateView.as_view(),
        name="enrollment-list-create",
    ),
    path(
        "<int:enrollment_id>/",
        EnrollmentDetailView.as_view(),
        name="enrollment-detail",
    ),
]