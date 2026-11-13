
from django.db.models import Count, Sum, Avg, Q

from apps.student.models import Student
from apps.instructor.models import Instructor
from apps.departments.models import Department
from apps.semester.models import Semester
from apps.course.models import Course
from apps.course_offering.models import CourseOffering
from apps.enrollments.models import Enrollment
from apps.attendance.models import Attendance
from apps.assessment.models import Assessment, AssessmentMark
from apps.result.models import Result


class ReportService:
    """
    Provides reporting data for the University LMS.
    Uses existing models; no additional database tables are required.
    """

    @staticmethod
    def dashboard_summary():
        return {
            "total_students": Student.objects.count(),
            "total_instructors": Instructor.objects.count(),
            "total_departments": Department.objects.count(),
            "total_semesters": Semester.objects.count(),
            "total_courses": Course.objects.count(),
            "total_course_offerings": CourseOffering.objects.count(),
            "total_enrollments": Enrollment.objects.count(),
            "total_attendance_records": Attendance.objects.count(),
            "total_assessments": Assessment.objects.count(),
            "total_results": Result.objects.count(),
            "published_results": Result.objects.filter(
                is_published=True
            ).count(),
        }

    @staticmethod
    def student_report():
        students = Student.objects.select_related(
            "user",
            "department",
            "semester",
        ).annotate(
            total_enrollments=Count(
                "enrollments",
                filter=Q(enrollments__is_active=True),
                distinct=True,
            )
        ).order_by("student_id")

        return [
            {
                "id": student.id,
                "student_id": student.student_id,
                "student_name": student.user.get_full_name(),
                "department": student.department.name,
                "semester": str(student.semester),
                "admission_year": student.admission_year,
                "session": student.session,
                "gender": student.gender,
                "status": student.status,
                "admission_status": student.admission_status,
                "total_enrollments": student.total_enrollments,
            }
            for student in students
        ]

    @staticmethod
    def instructor_report():
        instructors = Instructor.objects.select_related(
            "user",
            "department",
        ).annotate(
            total_course_offerings=Count(
                "course_offerings",
                filter=Q(course_offerings__is_active=True),
                distinct=True,
            )
        ).order_by("employee_id")

        return [
            {
                "id": instructor.id,
                "employee_id": instructor.employee_id,
                "instructor_name": instructor.user.get_full_name(),
                "department": instructor.department.name,
                "designation": instructor.get_designation_display(),
                "employment_status": instructor.employment_status,
                "experience_years": instructor.experience_years,
                "total_course_offerings": instructor.total_course_offerings,
            }
            for instructor in instructors
        ]

    @staticmethod
    def course_report():
        courses = Course.objects.select_related(
            "department",
            "semester",
        ).annotate(
            total_offerings=Count(
                "course_offerings",
                filter=Q(course_offerings__is_active=True),
                distinct=True,
            ),
            total_enrollments=Count(
                "course_offerings__enrollments",
                filter=Q(
                    course_offerings__is_active=True,
                    course_offerings__enrollments__is_active=True,
                ),
                distinct=True,
            ),
        ).order_by("course_code")

        return [
            {
                "id": course.id,
                "course_code": course.course_code,
                "course_title": course.course_title,
                "course_type": course.course_type,
                "credit": course.credit,
                "department": course.department.name,
                "semester": str(course.semester),
                "total_offerings": course.total_offerings,
                "total_enrollments": course.total_enrollments,
            }
            for course in courses
        ]

    @staticmethod
    def enrollment_report():
        enrollments = Enrollment.objects.select_related(
            "student__user",
            "course_offering__course",
            "course_offering__semester",
        ).order_by("-enrollment_date")

        return [
            {
                "id": enrollment.id,
                "student_id": enrollment.student.student_id,
                "student_name": enrollment.student.user.get_full_name(),
                "course_code": enrollment.course_offering.course.course_code,
                "course_title": enrollment.course_offering.course.course_title,
                "section": enrollment.course_offering.section,
                "semester": str(enrollment.course_offering.semester),
                "academic_year": enrollment.course_offering.academic_year,
                "status": enrollment.status,
                "enrollment_date": enrollment.enrollment_date,
            }
            for enrollment in enrollments
        ]

    @staticmethod
    def attendance_report():
        records = Attendance.objects.values(
            "enrollment__course_offering_id",
            "enrollment__course_offering__course__course_code",
            "enrollment__course_offering__course__course_title",
            "enrollment__course_offering__section",
            "enrollment__course_offering__semester__name",
            "enrollment__course_offering__academic_year",
        ).annotate(
            total_records=Count("id"),
            present_count=Count(
                "id",
                filter=Q(status=Attendance.Status.PRESENT),
            ),
            absent_count=Count(
                "id",
                filter=Q(status=Attendance.Status.ABSENT),
            ),
        ).order_by(
            "enrollment__course_offering__course__course_code"
        )

        report = []

        for record in records:
            total = record["total_records"]
            present = record["present_count"]

            percentage = (
                round((present / total) * 100, 2)
                if total else 0
            )

            report.append({
                "course_offering_id": record["enrollment__course_offering_id"],
                "course_code": record[
                    "enrollment__course_offering__course__course_code"
                ],
                "course_title": record[
                    "enrollment__course_offering__course__course_title"
                ],
                "section": record["enrollment__course_offering__section"],
                "semester": record[
                    "enrollment__course_offering__semester__name"
                ],
                "academic_year": record[
                    "enrollment__course_offering__academic_year"
                ],
                "total_records": total,
                "present_count": present,
                "absent_count": record["absent_count"],
                "attendance_percentage": percentage,
            })

        return report

    @staticmethod
    def assessment_report():
        assessments = Assessment.objects.select_related(
            "course_offering__course",
            "course_offering__semester",
        ).annotate(
            total_submissions=Count(
                "marks",
                filter=Q(marks__is_active=True),
                distinct=True,
            ),
            average_marks=Avg(
                "marks__obtained_marks",
                filter=Q(marks__is_active=True),
            ),
            total_obtained_marks=Sum(
                "marks__obtained_marks",
                filter=Q(marks__is_active=True),
            ),
        ).order_by("-assessment_date")

        return [
            {
                "id": assessment.id,
                "title": assessment.title,
                "assessment_type": assessment.assessment_type,
                "maximum_marks": assessment.maximum_marks,
                "assessment_date": assessment.assessment_date,
                "course_code": assessment.course_offering.course.course_code,
                "course_title": assessment.course_offering.course.course_title,
                "section": assessment.course_offering.section,
                "semester": str(assessment.course_offering.semester),
                "total_submissions": assessment.total_submissions,
                "average_marks": assessment.average_marks,
                "total_obtained_marks": assessment.total_obtained_marks,
            }
            for assessment in assessments
        ]

    @staticmethod
    def result_report():
        results = Result.objects.select_related(
            "enrollment__student",
            "enrollment__course_offering__course",
            "enrollment__course_offering__semester",
        ).order_by("-created_at")

        return [
            {
                "id": result.id,
                "student_id": result.enrollment.student.student_id,
                "course_code": (
                    result.enrollment.course_offering.course.course_code
                ),
                "course_title": (
                    result.enrollment.course_offering.course.course_title
                ),
                "section": result.enrollment.course_offering.section,
                "semester": str(
                    result.enrollment.course_offering.semester
                ),
                "academic_year": (
                    result.enrollment.course_offering.academic_year
                ),
                "total_marks": result.total_marks,
                "percentage": result.percentage,
                "letter_grade": result.letter_grade,
                "grade_point": result.grade_point,
                "status": result.status,
                "is_published": result.is_published,
            }
            for result in results
        ]

    @staticmethod
    def result_summary():
        results = Result.objects.filter(is_published=True)

        return {
            "total_results": results.count(),
            "pass_count": results.filter(
                status=Result.ResultStatus.PASS
            ).count(),
            "fail_count": results.filter(
                status=Result.ResultStatus.FAIL
            ).count(),
            "average_percentage": results.aggregate(
                average=Avg("percentage")
            )["average"] or 0,
            "average_grade_point": results.aggregate(
                average=Avg("grade_point")
            )["average"] or 0,
        }
