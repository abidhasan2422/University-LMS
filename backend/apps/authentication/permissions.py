from rest_framework.permissions import BasePermission

from apps.users.models import (
    UserRole,
    AccountStatus,
)


class IsAdmin(BasePermission):
    """
    Allow access only to administrators.
    """

    message = "Only administrators can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == Role.ADMIN
        )


class IsInstructor(BasePermission):
    """
    Allow access only to approved instructors.
    """

    message = "Only approved instructors can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == Role.INSTRUCTOR
            and request.user.status == AccountStatus.ACTIVE
        )


class IsStudent(BasePermission):
    """
    Allow access only to students.
    """

    message = "Only students can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == Role.STUDENT
        )


class IsAdminOrInstructor(BasePermission):
    """
    Allow access to administrators and approved instructors.
    """

    message = (
        "Only administrators or approved instructors "
        "can perform this action."
    )

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and (
                request.user.role == Role.ADMIN
                or (
                    request.user.role == Role.INSTRUCTOR
                    and request.user.status == AccountStatus.ACTIVE
                )
            )
        )


class IsAdminOrStudent(BasePermission):
    """
    Allow access to administrators and students.
    """

    message = (
        "Only administrators or students "
        "can perform this action."
    )

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in [
                Role.ADMIN,
                Role.STUDENT,
            ]
        )


class IsAuthenticatedAndActive(BasePermission):
    """
    Allow access only to authenticated active users.
    """

    message = "Your account is not active."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.status == AccountStatus.ACTIVE
        )