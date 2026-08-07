from django.db import models
from apps.common.models import BaseModel

class Department(BaseModel):
    """
    Department Model
    """

    name = models.CharField( max_length=150, unique=True)
    code = models.CharField(max_length=20,unique=True)
    description = models.TextField(blank=True,null=True)
    id_prefix= models.CharField(
        max_length=5,
        unique=True,
          blank=True,
    null=True,
    ) 
    class Meta:
        db_table = "departments"
        ordering = ["name"]
        verbose_name = "Department"
        verbose_name_plural = "Departments"

    def __str__(self):
        return f"{self.code} - {self.name}"