from rest_framework import serializers


class ReportSerializer(serializers.Serializer):
    """
    General-purpose serializer for report data.
    """
    def to_representation(self, instance):
        return instance