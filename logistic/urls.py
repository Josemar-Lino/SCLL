from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'branches', views.BranchViewSet)
router.register(r'users', views.UserProfileViewSet)
router.register(r'vehicles', views.VehicleViewSet)
router.register(r'appointments', views.AppointmentViewSet)
router.register(r'deliveries', views.DeliveryViewSet)
router.register(r'auth', views.AuthViewSet, basename='auth')

urlpatterns = [
    path('', include(router.urls)),
] 