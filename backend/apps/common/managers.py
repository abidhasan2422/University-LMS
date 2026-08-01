from django.db import models


class SoftDeleteManager(models.Manager):
    """
    Manager that returns only active objects.
    """

    def get_queryset(self):
        return super().get_queryset().filter(
            is_active=True
        )