
from django.db.models import Case, When, Value, IntegerField

from rest_framework import viewsets, permissions

from .models import Reading
from .serializers import ReadingSerializer


class ReadingViewSet(viewsets.ModelViewSet):
    serializer_class = ReadingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Reading.objects
            .filter(user=self.request.user)
            .annotate(
                slot_order=Case(
                    When(slot="MORNING", then=Value(1)),
                    When(slot="AFTER_BREAKFAST", then=Value(2)),
                    When(slot="AFTER_LUNCH", then=Value(3)),
                    When(slot="AFTER_DINNER", then=Value(4)),
                    output_field=IntegerField(),
                )
            )
            .order_by("-reading_date", "slot_order")
        )
