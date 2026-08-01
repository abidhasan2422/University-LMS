from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.authentication.permissions import IsAdmin
from .serializers import DepartmentSerializer
from .services import DepartmentService
from apps.common.pagination import (StandardResultsSetPagination)

class DepartmentListCreateView(APIView):
    """
    GET  : List all departments
    POST : Create a new department
    """

    def get_permissions(self):
        """
        POST -> Admin only
        GET  -> Any authenticated user
        """
        if self.request.method == "POST":
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get(self, request):   
         # Return all departments with search and ordering.

        search = request.query_params.get("search")
        ordering = request.query_params.get("ordering")
        departments = DepartmentService.get_all_departments(
        search=search,
        ordering = ordering,
    )

        pagination = StandardResultsSetPagination()
        result = pagination.paginate_queryset(departments,request)

        serializer = DepartmentSerializer(
             result,
            many=True,
        )

        return pagination.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = DepartmentSerializer(
            data=request.data
        )

        if serializer.is_valid():
            department = DepartmentService.create_department(
                serializer
            )

            return Response(
                DepartmentSerializer(department).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class DepartmentDetailView(APIView):
    """
    GET    : Retrieve a department
    PUT    : Update a department
    DELETE : Delete a department
    """

    def get_permissions(self):
        """
        PUT/DELETE -> Admin only
        GET        -> Any authenticated user
        """
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get(self, request, department_id):
        department = DepartmentService.get_department_by_id(
            department_id
        )

        serializer = DepartmentSerializer(
            department
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, department_id):
        department = DepartmentService.get_department_by_id(
            department_id
        )

        serializer = DepartmentSerializer(
            department,
            data=request.data,
        )

        if serializer.is_valid():
            department = DepartmentService.update_department(
                serializer
            )

            return Response(
                DepartmentSerializer(department).data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, department_id):
        department = DepartmentService.get_department_by_id(
            department_id
        )

        DepartmentService.delete_department(
            department
        )

        return Response(
            {
                "message": "Department deleted successfully."
            },
            status=status.HTTP_200_OK,
        )