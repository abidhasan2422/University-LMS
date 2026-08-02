from rest_framework import serializers

from .models import Semester


class SemesterSerializer(serializers.ModelSerializer):
    """
    Serializer for Semester model.
    """

    class Meta:
        model = Semester

        fields = (
            "id",
            "name",
            "year",
            "start_date",
            "end_date",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        """
        Validate semester data.
        """

        start_date = attrs.get("start_date",getattr(self.instance, "start_date", None),)

        end_date = attrs.get("end_date",getattr(self.instance, "end_date", None),)

        if start_date >= end_date:
            raise serializers.ValidationError(
                {
                    "end_date": "End date must be after start date."
                }
            )

        return attrs

    def validate_year(self, value):
        """
        Validate year.
        """

        if value < 2000:
            raise serializers.ValidationError(
                "Year cannot be less than 2000."
            )

        if value > 2100:
            raise serializers.ValidationError(
                "Year cannot be greater than 2100."
            )

        return value