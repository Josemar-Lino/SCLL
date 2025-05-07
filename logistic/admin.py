from django.contrib import admin
from .models import Branch, UserProfile, Vehicle, Appointment, Delivery

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('name', 'cnpj', 'created_at')
    search_fields = ('name', 'cnpj')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'branch', 'employee_id', 'is_supervisor')
    list_filter = ('branch', 'is_supervisor')
    search_fields = ('user__username', 'user__email', 'employee_id')

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('model', 'color', 'chassi')
    search_fields = ('model', 'chassi')

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'appointment_date', 'delivery_date', 'status', 'branch')
    list_filter = ('status', 'branch', 'appointment_date')
    search_fields = ('vehicle__model', 'seller', 'client')

@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ('appointment', 'status', 'delivery_date')
    list_filter = ('status', 'delivery_date')
    search_fields = ('appointment__vehicle__model', 'notes') 