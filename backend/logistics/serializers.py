from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Branch, UserProfile, Vehicle, Appointment, Delivery
from django.utils import timezone
from datetime import datetime, timedelta

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    employee_id = serializers.CharField(write_only=True, required=True)
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all(), write_only=True)
    is_supervisor = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'employee_id', 'branch', 'is_supervisor')

    def create(self, validated_data):
        employee_id = validated_data.pop('employee_id')
        branch = validated_data.pop('branch')
        is_supervisor = validated_data.pop('is_supervisor', False)
        
        # Criar usuário
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        
        # Criar perfil do usuário
        UserProfile.objects.create(
            user=user,
            branch=branch,
            employee_id=employee_id,
            is_supervisor=is_supervisor
        )
        
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    employee_id = serializers.CharField(write_only=True, required=False)
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all(), write_only=True, required=False)
    is_supervisor = serializers.BooleanField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'employee_id', 'branch', 'is_supervisor')

    def update(self, instance, validated_data):
        # Atualizar dados do usuário
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        if 'first_name' in validated_data:
            instance.first_name = validated_data['first_name']
        if 'last_name' in validated_data:
            instance.last_name = validated_data['last_name']
        if 'email' in validated_data:
            instance.email = validated_data['email']
        instance.save()

        # Atualizar perfil do usuário
        profile = instance.userprofile
        if 'employee_id' in validated_data:
            profile.employee_id = validated_data['employee_id']
        if 'branch' in validated_data:
            profile.branch = validated_data['branch']
        if 'is_supervisor' in validated_data:
            profile.is_supervisor = validated_data['is_supervisor']
        profile.save()

        return instance

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
    vehicle_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(),
        source='vehicle',
        write_only=True
    )
    preparer_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(),
        source='preparer',
        write_only=True,
        required=False,
        allow_null=True
    )
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.all(),
        source='branch',
        write_only=True
    )
    estimated_duration = serializers.DurationField(required=False)

    class Meta:
        model = Appointment
        fields = [
            'id', 'appointment_date', 'scheduled_date', 'delivery_date',
            'time', 'seller', 'client', 'client_phone', 'client_email',
            'vehicle', 'vehicle_id', 'branch', 'branch_id', 'preparer',
            'preparer_id', 'status', 'priority', 'estimated_duration',
            'actual_duration', 'notes', 'created_by', 'created_at',
            'updated_at'
        ]
        read_only_fields = ['scheduled_date', 'created_by', 'created_at', 'updated_at']

    def validate_appointment_date(self, value):
        if not value:
            raise serializers.ValidationError("A data do agendamento é obrigatória")
        try:
            # Garantir que a data está no formato YYYY-MM-DD
            datetime.strptime(str(value), '%Y-%m-%d')
        except ValueError:
            raise serializers.ValidationError("Formato de data inválido. Use YYYY-MM-DD")
        
        if value < timezone.now().date():
            raise serializers.ValidationError("A data do agendamento não pode ser no passado")
        return value

    def validate_time(self, value):
        if not value:
            raise serializers.ValidationError("O horário do agendamento é obrigatório")
        return value

    def validate_delivery_date(self, value):
        appointment_date = self.initial_data.get('appointment_date')
        if appointment_date and value and value < appointment_date:
            raise serializers.ValidationError("A data de entrega não pode ser anterior à data do agendamento")
        return value

    def validate_estimated_duration(self, value):
        if not value:
            return timedelta(hours=1)
        return value

    def validate_branch_id(self, value):
        if not value:
            raise serializers.ValidationError("A filial é obrigatória")
        try:
            Branch.objects.get(id=value)
        except Branch.DoesNotExist:
            raise serializers.ValidationError("Filial não encontrada")
        return value

    def validate(self, data):
        if 'appointment_date' in data and 'time' in data:
            try:
                appointment_datetime = timezone.make_aware(
                    datetime.combine(data['appointment_date'], data['time'])
                )
                if appointment_datetime < timezone.now():
                    raise serializers.ValidationError("O horário do agendamento não pode ser no passado")
            except (ValueError, TypeError) as e:
                raise serializers.ValidationError(f"Data ou hora inválida: {str(e)}")
        
        # Validar campos obrigatórios
        required_fields = ['appointment_date', 'time', 'seller', 'client', 'vehicle_id', 'branch_id']
        for field in required_fields:
            if field not in data:
                raise serializers.ValidationError(f"O campo {field} é obrigatório")
            if data[field] is None or (isinstance(data[field], str) and not data[field].strip()):
                raise serializers.ValidationError(f"O campo {field} não pode estar vazio")
        
        return data

class DeliverySerializer(serializers.ModelSerializer):
    appointment = AppointmentSerializer(read_only=True)

    class Meta:
        model = Delivery
        fields = '__all__'

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    branch = serializers.IntegerField(required=True)

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError('Email é obrigatório')
        return value.lower()

    def validate_password(self, value):
        if not value:
            raise serializers.ValidationError('Senha é obrigatória')
        if len(value) < 6:
            raise serializers.ValidationError('A senha deve ter pelo menos 6 caracteres')
        return value

    def validate_branch(self, value):
        try:
            Branch.objects.get(id=value)
            return value
        except Branch.DoesNotExist:
            raise serializers.ValidationError('Filial não encontrada')

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        branch = data.get('branch')

        if not all([email, password, branch]):
            raise serializers.ValidationError('Todos os campos são obrigatórios')

        return data 