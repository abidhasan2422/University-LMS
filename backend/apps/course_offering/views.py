from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

# Assuming your custom permissions and pagination are in these locations
from apps.authentication.permissions import IsAdmin
from apps.common.pagination import StandardResultsSetPagination

from .serializers import CourseOfferingSerializer
from .services import CourseOfferingService


class CourseOfferingListCreateView(APIView):
    """
    GET  : List all course offerings
    POST : Create a new course offering
    """
    def get_permissions(self):
        # Only Admins can create course offerings. Anyone authenticated can view them.
        if self.request.method == "POST":
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get(self, request):
        # Extract query parameters for the service layer
        search = request.query_params.get("search")
        ordering = request.query_params.get("ordering")
        course = request.query_params.get("course")
        instructor = request.query_params.get("instructor")
        semester = request.query_params.get("semester")
        academic_year = request.query_params.get("academic_year")
        section = request.query_params.get("section")
        status_param = request.query_params.get("status")

        # Fetch data using the service layer
        course_offerings = CourseOfferingService.get_all_course_offerings(
            search=search,
            ordering=ordering,
            course=course,
            instructor=instructor,
            semester=semester,
            academic_year=academic_year,
            section=section,
            status=status_param,
        )

        # Apply pagination
        paginator = StandardResultsSetPagination()
        result = paginator.paginate_queryset(course_offerings, request)
        
        serializer = CourseOfferingSerializer(result, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = CourseOfferingSerializer(data=request.data)
        
        if serializer.is_valid():
            # Create offering via service layer to trigger schedule validation
            course_offering = CourseOfferingService.create_course_offering(serializer)
            return Response(
                CourseOfferingSerializer(course_offering).data,
                status=status.HTTP_201_CREATED,
            )
            
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class CourseOfferingDetailView(APIView):
    """
    GET    : Retrieve a course offering
    PUT    : Update a course offering
    DELETE : Soft delete a course offering
    """
    def get_permissions(self):
        # Only Admins can edit or delete. Anyone authenticated can view details.
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get(self, request, course_offering_id):
        course_offering = CourseOfferingService.get_course_offering_by_id(course_offering_id)
        serializer = CourseOfferingSerializer(course_offering)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, course_offering_id):
        course_offering = CourseOfferingService.get_course_offering_by_id(course_offering_id)
        serializer = CourseOfferingSerializer(course_offering, data=request.data)
        
        if serializer.is_valid():
            # Update offering via service layer to re-trigger schedule validation
            course_offering = CourseOfferingService.update_course_offering(serializer)
            return Response(
                CourseOfferingSerializer(course_offering).data,
                status=status.HTTP_200_OK,
            )
            
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, course_offering_id):
        course_offering = CourseOfferingService.get_course_offering_by_id(course_offering_id)
        CourseOfferingService.delete_course_offering(course_offering)
        
        return Response(
            {"message": "Course offering deleted successfully."},
            status=status.HTTP_200_OK,
        )