from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Branch(models.Model):
    name = models.CharField(max_length=100)
    cnpj = models.CharField(max_length=14, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    employee_id = models.CharField(max_length=50)
    is_supervisor = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.branch.name}"

class Vehicle(models.Model):
    model = models.CharField(max_length=100)
    color = models.CharField(max_length=7)
    chassi = models.CharField(max_length=7)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.model} - {self.chassi}"

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Agendado'),
        ('in_progress', 'Em Andamento'),
        ('completed', 'Concluído'),
        ('cancelled', 'Cancelado'),
    ]

    appointment_date = models.DateField()
    scheduled_date = models.DateTimeField(auto_now_add=True)
    delivery_date = models.DateField()
    time = models.TimeField()
    seller = models.CharField(max_length=7)
    client = models.CharField(max_length=100)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    preparer = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, related_name='preparer_appointments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='created_appointments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.vehicle.model} - {self.appointment_date}"

    def save(self, *args, **kwargs):
        if not self.delivery_date:
            self.delivery_date = self.appointment_date + timezone.timedelta(days=3)
        super().save(*args, **kwargs)

class Delivery(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('delivered', 'Entregue'),
        ('cancelled', 'Cancelado'),
    ]

    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    delivery_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Entrega - {self.appointment.vehicle.model}" 