from apps.users.models import User, UserRole, AccountStatus
from apps.student.models import Student
from apps.instructor.models import Instructor
from apps.course.models import Course
from apps.departments.models import Department
from apps.enrollments.models import Enrollment


class AdminDashboardService:
    """
    Service for collecting Admin Dashboard statistics.
    """

    @staticmethod
    def get_dashboard_data():

        # =========================
        # Statistics
        # =========================

        total_students = Student.objects.count()

        total_instructors = Instructor.objects.count()

        total_courses = Course.objects.count()

        total_departments = Department.objects.count()

        # =========================
        # Pending Actions
        # =========================

        pending_instructor_approvals = User.objects.filter(
            role=UserRole.INSTRUCTOR,
            status=AccountStatus.PENDING,
        ).count()

        # =========================
        # System Overview
        # =========================

        active_students = Student.objects.filter(
            status=Student.Status.ACTIVE,
            user__is_active=True,
        ).count()

        active_instructors = Instructor.objects.filter(
            employment_status=Instructor.EmploymentStatus.ACTIVE,
            user__is_active=True,
        ).count()

        active_courses = Course.objects.count()

        active_enrollments = Enrollment.objects.filter(
            status=Enrollment.Status.ENROLLED,
        ).count()

        return {
            "statistics": {
                "total_students": total_students,
                "total_instructors": total_instructors,
                "total_courses": total_courses,
                "total_departments": total_departments,
            },

            "pending": {
                "instructor_approvals": pending_instructor_approvals,
            },

            "overview": {
                "active_students": active_students,
                "active_instructors": active_instructors,
                "active_courses": active_courses,
                "active_enrollments": active_enrollments,
            },
        }