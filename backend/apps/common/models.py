from django.db import models
from .managers import SoftDeleteManager

class BaseModel(models.Model):
    """
    Abstract base model for all application models.
    """

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # Returns only active records
    objects = SoftDeleteManager()

    # Returns all records (active + inactive)
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def soft_delete(self):
        """
        Soft delete the object.
        """
        self.is_active = False
        self.save(update_fields=["is_active"])

    def restore(self):
        """
        Restore the object.
        """
        self.is_active = True
        self.save(update_fields=["is_active"])