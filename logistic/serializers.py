from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Branch, UserProfile, Vehicle, Appointment, Delivery

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    branch = BranchSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    vehicle = VehicleSerializer(read_only=True)
    branch = BranchSerializer(read_only=True)
    preparer = UserProfileSerializer(read_only=True)
    created_by = UserProfileSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'

class DeliverySerializer(serializers.ModelSerializer):
    appointment = AppointmentSerializer(read_only=True)

    class Meta:
        model = Delivery
        fields = '__all__'

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    branch = serializers.IntegerField() 