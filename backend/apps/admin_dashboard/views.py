from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import UserRole

from .services import AdminDashboardService


class AdminDashboardView(APIView):
    """
    API endpoint for Admin Dashboard statistics.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Only ADMIN users can access the dashboard
        if request.user.role != UserRole.ADMIN:
            return Response(
                {
                    "detail": "You do not have permission to access the admin dashboard."
                },
                status=403,
            )

        data = AdminDashboardService.get_dashboard_data()

        return Response(data)