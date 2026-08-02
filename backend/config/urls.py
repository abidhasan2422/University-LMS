from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/",include("apps.authentication.urls")),
    path("api/departments/",include("apps.departments.urls")),
    path("api/semesters/",include("apps.semester.urls")),
]