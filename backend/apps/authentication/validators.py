import re

from django.core.exceptions import ValidationError


def validate_phone_number(phone_number):
    """
    Validate Bangladeshi phone number.
    Example:
        01712345678
        +8801712345678
    """

    pattern = r"^(?:\+8801|01)[3-9]\d{8}$"

    if not re.match(pattern, phone_number):
        raise ValidationError(
            "Enter a valid Bangladeshi phone number."
        )


def validate_password_strength(password):
    """
    Password Rules:
    - At least 8 characters
    - One uppercase letter
    - One lowercase letter
    - One digit
    - One special character
    """

    if len(password) < 8:
        raise ValidationError(
            "Password must contain at least 8 characters."
        )

    if not re.search(r"[A-Z]", password):
        raise ValidationError(
            "Password must contain at least one uppercase letter."
        )

    if not re.search(r"[a-z]", password):
        raise ValidationError(
            "Password must contain at least one lowercase letter."
        )

    if not re.search(r"\d", password):
        raise ValidationError(
            "Password must contain at least one digit."
        )

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise ValidationError(
            "Password must contain at least one special character."
        )