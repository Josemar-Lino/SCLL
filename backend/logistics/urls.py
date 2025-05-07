from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BranchViewSet, UserProfileViewSet, VehicleViewSet,
    AppointmentViewSet, DeliveryViewSet, AuthViewSet,
    UserViewSet
)

router = DefaultRouter()
router.register(r'branches', BranchViewSet)
router.register(r'users', UserViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'vehicles', VehicleViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'deliveries', DeliveryViewSet)
router.register(r'auth', AuthViewSet, basename='auth')

urlpatterns = [
    path('', include(router.urls)),
] 