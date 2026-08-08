from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/",include("apps.authentication.urls")),
    path("api/departments/",include("apps.departments.urls")),
    path("api/semesters/",include("apps.semester.urls")),
    path("api/students/",include("apps.student.urls")),
    path("api/instructors/",include("apps.instructor.urls")),
    path("api/course-offering/", include("apps.course_offering.urls")), 
    path("api/enrollments/", include("apps.enrollments.urls")),  
    path("api/attendance/", include("apps.attendance.urls")),
]