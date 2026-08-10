from rest_framework import serializers

from apps.enrollments.models import Enrollment

from .models import Assessment, AssessmentMark


class AssessmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Assessment.

    An assessment represents a marks component for a
    course. Students do not submit anything through
    this module. Instructors only enter marks.
    """

    course_code = serializers.CharField(
        source="course_offering.course.course_code",
        read_only=True,
    )

    course_title = serializers.CharField(
        source="course_offering.course.course_title",
        read_only=True,
    )

    course_type = serializers.CharField(
        source="course_offering.course.course_type",
        read_only=True,
    )

    instructor_name = serializers.SerializerMethodField()

    semester_name = serializers.CharField(
        source="course_offering.semester.name",
        read_only=True,
    )

    section = serializers.CharField(
        source="course_offering.section",
        read_only=True,
    )

    class Meta:
        model = Assessment

        fields = (
            "id",
            "course_offering",
            "course_code",
            "course_title",
            "course_type",
            "instructor_name",
            "semester_name",
            "section",
            "assessment_type",
            "maximum_marks",
            "assessment_date",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

    def get_instructor_name(self, obj):
        """
        Return instructor's full name.
        """

        return obj.course_offering.instructor.user.get_full_name()

    def validate_maximum_marks(self, value):
        """
        Maximum marks must be greater than zero.
        """

        if value <= 0:
            raise serializers.ValidationError(
                "Maximum marks must be greater than zero."
            )

        return value

    def validate(self, attrs):
        """
        Validate assessment type according to
        the course type.
        """

        course_offering = attrs.get(
            "course_offering"
        )

        assessment_type = attrs.get(
            "assessment_type"
        )

        if not course_offering or not assessment_type:
            return attrs

        course_type = (
            course_offering.course.course_type
        )

        regular_types = {
            Assessment.AssessmentType.ASSIGNMENT,
            Assessment.AssessmentType.QUIZ,
            Assessment.AssessmentType.PRESENTATION,
            Assessment.AssessmentType.MID,
            Assessment.AssessmentType.FINAL,
        }

        lab_types = {
            Assessment.AssessmentType.LAB_PERFORMANCE,
            Assessment.AssessmentType.LAB_VIVA,
            Assessment.AssessmentType.LAB_FINAL,
        }

        if course_type == "REGULAR":

            if assessment_type not in regular_types:
                raise serializers.ValidationError(
                    {
                        "assessment_type": (
                            "This assessment type is not "
                            "valid for a regular course."
                        )
                    }
                )

        elif course_type == "LAB":

            if assessment_type not in lab_types:
                raise serializers.ValidationError(
                    {
                        "assessment_type": (
                            "This assessment type is not "
                            "valid for a lab course."
                        )
                    }
                )

        return attrs


class AssessmentMarkSerializer(serializers.ModelSerializer):
    """
    Serializer for marks obtained by a student.

    The instructor only records marks obtained by
    the student. There is no student submission
    functionality.
    """

    student_id_code = serializers.CharField(
        source="enrollment.student.student_id",
        read_only=True,
    )

    student_name = serializers.SerializerMethodField()

    assessment_type = serializers.CharField(
        source="assessment.assessment_type",
        read_only=True,
    )

    maximum_marks = serializers.DecimalField(
        source="assessment.maximum_marks",
        max_digits=5,
        decimal_places=2,
        read_only=True,
    )

    course_code = serializers.CharField(
        source=(
            "assessment.course_offering"
            ".course.course_code"
        ),
        read_only=True,
    )

    course_title = serializers.CharField(
        source=(
            "assessment.course_offering"
            ".course.course_title"
        ),
        read_only=True,
    )

    course_type = serializers.CharField(
        source=(
            "assessment.course_offering"
            ".course.course_type"
        ),
        read_only=True,
    )

    class Meta:
        model = AssessmentMark

        fields = (
            "id",
            "assessment",
            "assessment_type",
            "maximum_marks",
            "enrollment",
            "student_id_code",
            "student_name",
            "course_code",
            "course_title",
            "course_type",
            "obtained_marks",
            "remarks",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

    def get_student_name(self, obj):
        """
        Return student's full name.
        """

        return obj.enrollment.student.user.get_full_name()

    def validate(self, attrs):
        """
        Validate assessment marks.
        """

        assessment = attrs.get(
            "assessment",
            getattr(
                self.instance,
                "assessment",
                None,
            ),
        )

        enrollment = attrs.get(
            "enrollment",
            getattr(
                self.instance,
                "enrollment",
                None,
            ),
        )

        obtained_marks = attrs.get(
            "obtained_marks",
            getattr(
                self.instance,
                "obtained_marks",
                None,
            ),
        )

        if not assessment:
            raise serializers.ValidationError(
                {
                    "assessment": (
                        "Assessment is required."
                    )
                }
            )

        if not enrollment:
            raise serializers.ValidationError(
                {
                    "enrollment": (
                        "Enrollment is required."
                    )
                }
            )

        # Enrollment must be active.
        if not enrollment.is_active:
            raise serializers.ValidationError(
                {
                    "enrollment": (
                        "This enrollment is inactive."
                    )
                }
            )

        # Student must be enrolled.
        if (
            enrollment.status
            != Enrollment.Status.ENROLLED
        ):
            raise serializers.ValidationError(
                {
                    "enrollment": (
                        "Marks can only be entered "
                        "for an enrolled student."
                    )
                }
            )

        # Assessment and enrollment must belong
        # to the same course offering.
        if (
            assessment.course_offering_id
            != enrollment.course_offering_id
        ):
            raise serializers.ValidationError(
                {
                    "enrollment": (
                        "This student is not enrolled "
                        "in the course offering for "
                        "this assessment."
                    )
                }
            )

        # Obtained marks validation.
        if obtained_marks is not None:

            if obtained_marks < 0:
                raise serializers.ValidationError(
                    {
                        "obtained_marks": (
                            "Obtained marks cannot "
                            "be negative."
                        )
                    }
                )

            if (
                obtained_marks
                > assessment.maximum_marks
            ):
                raise serializers.ValidationError(
                    {
                        "obtained_marks": (
                            f"Obtained marks cannot "
                            f"exceed "
                            f"{assessment.maximum_marks}."
                        )
                    }
                )

        return attrs