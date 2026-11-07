
from rest_framework.routers import DefaultRouter

from .views import ReadingViewSet

router = DefaultRouter()
router.register("readings", ReadingViewSet, basename="reading")

urlpatterns = router.urls
