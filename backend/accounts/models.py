
from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    target_low = models.PositiveIntegerField(default=70)
    target_high = models.PositiveIntegerField(default=180)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    def save(self, *args, **kwargs):
        if not (40 <= self.target_low <= 600):
            raise ValueError("Lower target must be between 40 and 600.")

        if not (40 <= self.target_high <= 600):
            raise ValueError("Upper target must be between 40 and 600.")

        if self.target_low >= self.target_high:
            raise ValueError("Lower target must be less than upper target.")

        super().save(*args, **kwargs)

    class Meta:
        ordering = ["user__username"]
