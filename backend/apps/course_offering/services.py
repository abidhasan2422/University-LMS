from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError

from apps.common.query_service import QueryService

from .models import CourseOffering


class CourseOfferingService:
    """
    Service layer for Course Offering business logic.
    """

    @staticmethod
    def validate_instructor_schedule(
        instructor,
        day,
        start_time,
        end_time,
        exclude_id=None,
    ):
        """
        Validate instructor schedule conflict.
        """

        queryset = CourseOffering.objects.filter(
            instructor=instructor,
            day=day,
            is_active=True,
        )

        if exclude_id:
            queryset = queryset.exclude(id=exclude_id)

        conflict = queryset.filter(
            start_time__lt=end_time,
            end_time__gt=start_time,
        ).exists()

        if conflict:
            raise ValidationError(
                {
                    "schedule": (
                        "This instructor already has another class "
                        "during the selected time."
                    )
                }
            )

    @staticmethod
    def validate_room_schedule(
        room,
        day,
        start_time,
        end_time,
        exclude_id=None,
    ):
        """
        Validate room schedule conflict.
        """

        queryset = CourseOffering.objects.filter(
            room=room,
            day=day,
            is_active=True,
        )

        if exclude_id:
            queryset = queryset.exclude(id=exclude_id)

        conflict = queryset.filter(
            start_time__lt=end_time,
            end_time__gt=start_time,
        ).exists()

        if conflict:
            raise ValidationError(
                {
                    "room": (
                        "This room is already booked during the selected time."
                    )
                }
            )

    @staticmethod
    def create_course_offering(serializer):
        """
        Create a new course offering.
        """

        data = serializer.validated_data

        CourseOfferingService.validate_instructor_schedule(
            instructor=data["instructor"],
            day=data["day"],
            start_time=data["start_time"],
            end_time=data["end_time"],
        )

        CourseOfferingService.validate_room_schedule(
            room=data["room"],
            day=data["day"],
            start_time=data["start_time"],
            end_time=data["end_time"],
        )

        return serializer.save()

    @staticmethod
    def get_all_course_offerings(
        search=None,
        ordering=None,
        course=None,
        instructor=None,
        semester=None,
        academic_year=None,
        section=None,
        status=None,
    ):
        """
        Return all course offerings with search,
        ordering and filtering.
        """

        queryset = CourseOffering.objects.select_related(
            "course",
            "instructor",
            "instructor__user",
            "semester",
        )

        return QueryService.apply(
            queryset=queryset,
            search=search,
            search_fields=[
                "course__course_code",
                "course__course_title",
                "instructor__employee_id",
                "instructor__user__first_name",
                "instructor__user__last_name",
                "room",
            ],
            ordering=ordering,
            allowed_ordering=[
                "academic_year",
                "-academic_year",
                "course__course_code",
                "-course__course_code",
                "capacity",
                "-capacity",
                "start_time",
                "-start_time",
                "created_at",
                "-created_at",
            ],
            filters={
                "course_id": course,
                "instructor_id": instructor,
                "semester_id": semester,
                "academic_year": academic_year,
                "section": section,
                "status": status,
            },
        )

    @staticmethod
    def get_course_offering_by_id(course_offering_id):
        """
        Return a single course offering.
        """

        return get_object_or_404(
            CourseOffering.objects.select_related(
                "course",
                "instructor",
                "instructor__user",
                "semester",
            ),
            id=course_offering_id,
        )

    @staticmethod
    def update_course_offering(serializer):
        """
        Update a course offering.
        """

        instance = serializer.instance
        data = serializer.validated_data

        instructor = data.get(
            "instructor",
            instance.instructor,
        )

        room = data.get(
            "room",
            instance.room,
        )

        day = data.get(
            "day",
            instance.day,
        )

        start_time = data.get(
            "start_time",
            instance.start_time,
        )

        end_time = data.get(
            "end_time",
            instance.end_time,
        )

        CourseOfferingService.validate_instructor_schedule(
            instructor=instructor,
            day=day,
            start_time=start_time,
            end_time=end_time,
            exclude_id=instance.id,
        )

        CourseOfferingService.validate_room_schedule(
            room=room,
            day=day,
            start_time=start_time,
            end_time=end_time,
            exclude_id=instance.id,
        )

        return serializer.save()

    @staticmethod
    def delete_course_offering(course_offering):
        """
        Soft delete a course offering.
        """

        course_offering.soft_delete()

        return course_offering

    @staticmethod
    def restore_course_offering(course_offering):
        """
        Restore a soft deleted course offering.
        """

        course_offering.restore()

        return course_offering

    @staticmethod
    def get_deleted_course_offerings():
        """
        Return all deleted course offerings.
        """

        return (
            CourseOffering.all_objects.filter(
                is_active=False
            ).select_related(
                "course",
                "instructor",
                "instructor__user",
                "semester",
            )
        )