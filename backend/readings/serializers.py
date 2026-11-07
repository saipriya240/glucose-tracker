
from datetime import datetime, timezone, timedelta

from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Reading


class ReadingSerializer(serializers.ModelSerializer):

    reading_date = serializers.DateField(
        input_formats=["%Y-%m-%d"],
        error_messages={
            "invalid": "Please enter a valid date.",
            "required": "Please select a reading date.",
        }
    )

    slot = serializers.ChoiceField(
        choices=Reading.Slot.choices,
        error_messages={
            "required": "Please select a reading time slot.",
            "invalid_choice": "Please select a valid reading time slot.",
        }
    )

    glucose_value = serializers.IntegerField(
        error_messages={
            "required": "Please enter a glucose value.",
            "invalid": "Value must be a whole number.",
        }
    )

    class Meta:
        model = Reading
        fields = [
            "id",
            "reading_date",
            "slot",
            "glucose_value",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_reading_date(self, value):
        max_allowed_date = (
            datetime.now(timezone.utc).date() + timedelta(days=1)
        )

        if value > max_allowed_date:
            raise serializers.ValidationError(
                "Date cannot be in the future."
            )

        return value

    def validate_glucose_value(self, value):
        if not 40 <= value <= 600:
            raise serializers.ValidationError(
                "Value must be between 40 and 600 mg/dl."
            )

        return value

    def validate(self, attrs):
        user = self.context["request"].user

        reading_date = attrs.get(
            "reading_date",
            getattr(self.instance, "reading_date", None)
        )

        slot = attrs.get(
            "slot",
            getattr(self.instance, "slot", None)
        )

        if reading_date and slot:
            existing = Reading.objects.filter(
                user=user,
                reading_date=reading_date,
                slot=slot,
            )

            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)

            if existing.exists():
                slot_label = dict(Reading.Slot.choices)[slot]
                raise serializers.ValidationError({
                    "slot": (
                        f"You already have a {slot_label} "
                        "reading for this date."
                    )
                })

            daily_count = Reading.objects.filter(
                user=user,
                reading_date=reading_date,
            ).exclude(
                pk=self.instance.pk if self.instance else None
            ).count()

            if daily_count >= 4:
                raise serializers.ValidationError({
                    "non_field_errors": [
                        "You can add only 4 readings per day."
                    ]
                })

        return attrs

    def create(self, validated_data):
        return Reading.objects.create(
            user=self.context["request"].user,
            **validated_data
        )
