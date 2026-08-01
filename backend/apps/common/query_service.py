from django.db.models import Q


class QueryService:
    """
    Reusable service for search, ordering, and filtering.
    """

    @staticmethod
    def apply_search(queryset, search, search_fields):
        """
        Apply search across multiple fields.
        """

        if not search:
            return queryset

        query = Q()

        for field in search_fields:
            query |= Q(**{f"{field}__icontains": search})

        return queryset.filter(query)
    @staticmethod
    def apply_ordering(queryset, ordering, allowed_ordering):
        """
        Apply ordering to the queryset.
        """

        if not ordering:
            return queryset

        if ordering in allowed_ordering:
            return queryset.order_by(ordering)

        return queryset
    @staticmethod
    def apply_filters(queryset, filters):
        """
        Apply dynamic filters to the queryset.

        Example:
            filters = {
                "is_active": True,
                "department_id": 1,
                "semester_id": 2,
            }
        """

        if not filters:
            return queryset

        cleaned_filters = {
            key: value
            for key, value in filters.items()
            if value is not None
        }

        return queryset.filter(**cleaned_filters)
    @staticmethod
    def apply(
        queryset,
        search=None,
        search_fields=None,
        ordering=None,
        allowed_ordering=None,
        filters=None,
    ):
        """
        Apply search, ordering, and filters to a queryset.
        """

        queryset = QueryService.apply_search(
            queryset=queryset,
            search=search,
            search_fields=search_fields or [],
        )

        queryset = QueryService.apply_ordering(
            queryset=queryset,
            ordering=ordering,
            allowed_ordering=allowed_ordering or [],
        )

        queryset = QueryService.apply_filters(
            queryset=queryset,
            filters=filters or {},
        )

        return queryset