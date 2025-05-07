from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from logistics.models import Branch, UserProfile

class Command(BaseCommand):
    help = 'Cria dados iniciais para o sistema'

    def handle(self, *args, **kwargs):
        # Criar filial principal
        branch, created = Branch.objects.get_or_create(
            name='Matriz',
            cnpj='12345678901234'
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Filial criada com sucesso!'))
        else:
            self.stdout.write(self.style.SUCCESS('Filial já existe!'))

        # Criar superusuário
        if not User.objects.filter(username='admin').exists():
            user = User.objects.create_superuser(
                username='admin',
                email='admin@logistica.com',
                password='admin123',
                first_name='Administrador',
                last_name='Sistema'
            )
            
            # Criar perfil do usuário
            UserProfile.objects.create(
                user=user,
                branch=branch,
                employee_id='ADM001',
                is_supervisor=True
            )
            
            self.stdout.write(self.style.SUCCESS('Superusuário criado com sucesso!'))
        else:
            self.stdout.write(self.style.SUCCESS('Superusuário já existe!'))

        # Criar preparadores iniciais
        preparadores = [
            {
                'username': 'joao.silva',
                'email': 'joao.silva@logistica.com',
                'password': 'prep123',
                'first_name': 'João',
                'last_name': 'Silva',
                'employee_id': 'PREP001'
            },
            {
                'username': 'maria.santos',
                'email': 'maria.santos@logistica.com',
                'password': 'prep123',
                'first_name': 'Maria',
                'last_name': 'Santos',
                'employee_id': 'PREP002'
            },
            {
                'username': 'pedro.oliveira',
                'email': 'pedro.oliveira@logistica.com',
                'password': 'prep123',
                'first_name': 'Pedro',
                'last_name': 'Oliveira',
                'employee_id': 'PREP003'
            }
        ]

        for prep in preparadores:
            user, created = User.objects.get_or_create(
                username=prep['username'],
                defaults={
                    'email': prep['email'],
                    'first_name': prep['first_name'],
                    'last_name': prep['last_name'],
                    'is_active': True
                }
            )
            
            if created:
                user.set_password(prep['password'])
                user.save()
                
                UserProfile.objects.create(
                    user=user,
                    branch=branch,
                    employee_id=prep['employee_id'],
                    is_supervisor=False
                )
                
                self.stdout.write(self.style.SUCCESS(f'Preparador {prep["first_name"]} {prep["last_name"]} criado com sucesso!'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Preparador {prep["first_name"]} {prep["last_name"]} já existe!')) 