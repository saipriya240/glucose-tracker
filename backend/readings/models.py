from django.db import models

# Create your models here.

from django.db import models
from django.contrib.auth.models import User
from django.db.models import Q


class Reading(models.Model):

    class Slot(models.TextChoices):
        MORNING = "MORNING", "Morning (Fasting)"
        AFTER_BREAKFAST = "AFTER_BREAKFAST", "After Breakfast"
        AFTER_LUNCH = "AFTER_LUNCH", "After Lunch"
        AFTER_DINNER = "AFTER_DINNER", "After Dinner"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="readings"
    )

    reading_date = models.DateField()

    slot = models.CharField(
        max_length=30,
        choices=Slot.choices
    )

    glucose_value = models.PositiveIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "reading_date", "slot"],
                name="unique_user_date_slot"
            ),
            models.CheckConstraint(
                condition=Q(glucose_value__gte=40) &
                          Q(glucose_value__lte=600),
                name="glucose_value_between_40_600"
            ),
        ]

        indexes = [
            models.Index(
                fields=["user", "-reading_date"],
                name="reading_user_date_idx"
            )
        ]

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.reading_date} - "
            f"{self.slot} - "
            f"{self.glucose_value} mg/dL"
        )
