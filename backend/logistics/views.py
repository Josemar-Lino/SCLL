from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Branch, UserProfile, Vehicle, Appointment, Delivery
from .serializers import (
    BranchSerializer, UserProfileSerializer, VehicleSerializer,
    AppointmentSerializer, DeliverySerializer, LoginSerializer,
    UserCreateSerializer, UserUpdateSerializer, UserSerializer
)
import logging
import traceback

logger = logging.getLogger(__name__)

class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        logger.info(f"UserProfileViewSet - User: {user.username}, is_superuser: {user.is_superuser}")
        
        queryset = UserProfile.objects.all()
        logger.info(f"Initial queryset count: {queryset.count()}")
        
        # Filtrar por filial
        if not user.is_superuser:
            branch = user.userprofile.branch
            logger.info(f"Filtering by branch: {branch.id} - {branch.name}")
            queryset = queryset.filter(branch=branch)
            logger.info(f"After branch filter count: {queryset.count()}")
        
        # Filtrar por tipo de usuário (preparador)
        is_preparer = self.request.query_params.get('is_preparer', None)
        logger.info(f"is_preparer parameter: {is_preparer}")
        
        if is_preparer is not None:
            is_preparer = is_preparer.lower() == 'true'
            logger.info(f"Filtering preparers (is_preparer={is_preparer})")
            queryset = queryset.filter(is_supervisor=not is_preparer)
            logger.info(f"After preparer filter count: {queryset.count()}")
        
        # Log dos resultados
        for profile in queryset:
            logger.info(f"Profile: {profile.id} - User: {profile.user.username} - Supervisor: {profile.is_supervisor}")
        
        return queryset

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Appointment.objects.all()
        
        # Filtrar por filial
        if not user.is_superuser:
            queryset = queryset.filter(branch=user.userprofile.branch)
        
        # Filtrar por data
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(appointment_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(appointment_date__lte=end_date)
        
        # Filtrar por status
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filtrar por preparador
        preparer = self.request.query_params.get('preparer', None)
        if preparer:
            queryset = queryset.filter(preparer_id=preparer)
        
        # Filtrar por prioridade
        priority = self.request.query_params.get('priority', None)
        if priority is not None:
            priority = priority.lower() == 'true'
            queryset = queryset.filter(priority=priority)
        
        return queryset.select_related('vehicle', 'branch', 'preparer', 'created_by')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.userprofile)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        appointment = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Status não fornecido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in dict(Appointment.STATUS_CHOICES):
            return Response(
                {'error': 'Status inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = new_status
        appointment.save()
        
        return Response(self.get_serializer(appointment).data)

    @action(detail=True, methods=['post'])
    def update_duration(self, request, pk=None):
        appointment = self.get_object()
        actual_duration = request.data.get('actual_duration')
        
        if not actual_duration:
            return Response(
                {'error': 'Duração não fornecida'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.actual_duration = actual_duration
        appointment.save()
        
        return Response(self.get_serializer(appointment).data)

class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all()
    serializer_class = DeliverySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Delivery.objects.all()
        return Delivery.objects.filter(appointment__branch=user.userprofile.branch)

class AuthViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def login(self, request):
        try:
            logger.info(f"Login attempt with data: {request.data}")
            serializer = LoginSerializer(data=request.data)
            
            if not serializer.is_valid():
                logger.error(f"Serializer errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            branch_id = serializer.validated_data['branch']
            
            logger.info(f"Attempting to find user with email: {email}")
            
            try:
                user = User.objects.get(email=email)
                logger.info(f"User found: {user.username}")
                
                if not user.is_active:
                    logger.error("User account is inactive")
                    return Response(
                        {'error': 'Conta de usuário inativa'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
                if user.check_password(password):
                    logger.info("Password check passed")
                    try:
                        user_profile = UserProfile.objects.get(user=user, branch_id=branch_id)
                        logger.info(f"User profile found: {user_profile.id}")
                        
                        refresh = RefreshToken.for_user(user)
                        response_data = {
                            'token': str(refresh.access_token),
                            'refresh': str(refresh),
                            'user': {
                                'id': user.id,
                                'username': user.username,
                                'email': user.email,
                                'first_name': user.first_name,
                                'last_name': user.last_name,
                                'is_supervisor': user_profile.is_supervisor,
                                'branch': {
                                    'id': user_profile.branch.id,
                                    'name': user_profile.branch.name
                                },
                                'employee_id': user_profile.employee_id
                            }
                        }
                        logger.info("Login successful")
                        return Response(response_data)
                    except UserProfile.DoesNotExist:
                        logger.error(f"User profile not found for branch_id: {branch_id}")
                        return Response(
                            {'error': 'Perfil de usuário não encontrado para esta filial'},
                            status=status.HTTP_401_UNAUTHORIZED
                        )
                else:
                    logger.error("Password check failed")
                    return Response(
                        {'error': 'Senha incorreta'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            except User.DoesNotExist:
                logger.error(f"User not found with email: {email}")
                return Response(
                    {'error': 'Usuário não encontrado'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except Exception as e:
            logger.error(f"Unexpected error during login: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': 'Erro interno do servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            if not request.user.is_authenticated:
                return Response(
                    {'error': 'Usuário não autenticado'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            user = request.user
            user_profile = UserProfile.objects.get(user=user)
            
            response_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_supervisor': user_profile.is_supervisor,
                'branch': {
                    'id': user_profile.branch.id,
                    'name': user_profile.branch.name
                },
                'employee_id': user_profile.employee_id
            }
            
            return Response(response_data)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Perfil de usuário não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error in me endpoint: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': 'Erro interno do servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def refresh(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'error': 'Token de atualização não fornecido'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            refresh = RefreshToken(refresh_token)
            response_data = {
                'token': str(refresh.access_token),
                'refresh': str(refresh)
            }
            return Response(response_data)
        except Exception as e:
            logger.error(f"Error in refresh endpoint: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': 'Token inválido ou expirado'},
                status=status.HTTP_401_UNAUTHORIZED
            )

    @action(detail=False, methods=['post'])
    def logout(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logout realizado com sucesso'})
        except Exception as e:
            logger.error(f"Error in logout endpoint: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': 'Erro ao realizar logout'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return User.objects.all()
        
        # Filtrar usuários da mesma filial
        branch = user.userprofile.branch
        return User.objects.filter(userprofile__branch=branch)

    def perform_destroy(self, instance):
        # Não permitir excluir o próprio usuário
        if instance == self.request.user:
            raise permissions.PermissionDenied("Não é possível excluir seu próprio usuário")
        instance.delete()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data) 