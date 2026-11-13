
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.reports.services import ReportService
from apps.reports.serializers import ReportSerializer


class BaseReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            data = self.get_report_data(request)

            serializer = ReportSerializer(data, many=True) if isinstance(
                data, list
            ) else ReportSerializer(data)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as error:
            return Response(
                {"detail": str(error)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def get_report_data(self, request):
        raise NotImplementedError


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            data = ReportService.dashboard_summary()
            return Response(data, status=status.HTTP_200_OK)

        except Exception as error:
            return Response(
                {"detail": str(error)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class StudentReportView(BaseReportView):
    def get_report_data(self, request):
        return ReportService.student_report()


class InstructorReportView(BaseReportView):
    def get_report_data(self, request):
        return ReportService.instructor_report()


class CourseReportView(BaseReportView):
    def get_report_data(self, request):
        return ReportService.course_report()


class EnrollmentReportView(BaseReportView):
    def get_report_data(self, request):
        return ReportService.enrollment_report()


class AttendanceReportView(BaseReportView):
    def get_report_data(self, request):
        return ReportService.attendance_report()


class AssessmentReportView(BaseReportView):
    def get_report_data(self, request):
        return ReportService.assessment_report()


class ResultReportView(BaseReportView):
    def get_report_data(self, request):
        return ReportService.result_report()


class ResultSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            data = ReportService.result_summary()
            return Response(data, status=status.HTTP_200_OK)

        except Exception as error:
            return Response(
                {"detail": str(error)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
