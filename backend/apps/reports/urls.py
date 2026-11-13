
from django.urls import path

from apps.reports.views import (
    DashboardSummaryView,
    StudentReportView,
    InstructorReportView,
    CourseReportView,
    EnrollmentReportView,
    AttendanceReportView,
    AssessmentReportView,
    ResultReportView,
    ResultSummaryView,
)

urlpatterns = [
    path("dashboard/", DashboardSummaryView.as_view(), name="report-dashboard"),
    path("students/", StudentReportView.as_view(), name="student-report"),
    path("instructors/", InstructorReportView.as_view(), name="instructor-report"),
    path("courses/", CourseReportView.as_view(), name="course-report"),
    path("enrollments/", EnrollmentReportView.as_view(), name="enrollment-report"),
    path("attendance/", AttendanceReportView.as_view(), name="attendance-report"),
    path("assessments/", AssessmentReportView.as_view(), name="assessment-report"),
    path("results/", ResultReportView.as_view(), name="result-report"),
    path("results/summary/", ResultSummaryView.as_view(), name="result-summary"),
]
