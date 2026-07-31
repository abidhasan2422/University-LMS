from rest_framework import serializers

from .models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Department model.
    """

    class Meta:
        model = Department
        fields = (
            "id",
            "name",
            "code",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

    def validate_name(self, value):
        """
        Ensure the department name is unique.
        """
        queryset = Department.objects.filter(name__iexact=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "A department with this name already exists."
            )

        return value
       

    def validate_code(self, value):
        """
        Ensure the department code is unique.
        """
        value = value.upper()

        if Department.objects.filter(code__iexact=value).exists():
            raise serializers.ValidationError(
                "A department with this code already exists."
            )
        return value