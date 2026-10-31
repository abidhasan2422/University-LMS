from django.urls import path
from .views import DepartmentListCreateView, DepartmentDetailView,DepartmentRestoreView,DeletedDepartmentListView

urlpatterns = [     
    path("", DepartmentListCreateView.as_view()),
    path("<int:department_id>/", DepartmentDetailView.as_view()),
    path("<int:department_id>/restore/",DepartmentRestoreView.as_view(),
    name="department-restore",),
       path(
        "<int:department_id>/restore/",
        DepartmentRestoreView.as_view(),
        name="department-restore",
    ),
    
]