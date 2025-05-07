import os
import django
from django.contrib.auth.hashers import make_password

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'logistics.settings')
django.setup()

from django.contrib.auth.models import User
from django.db import connection

def create_admin_user():
    try:
        # Criar o usuário admin
        admin_user = User.objects.create(
            username='admin',
            email='admin@admin.com.br',
            password=make_password('12354'),
            is_staff=True,
            is_superuser=True,
            is_active=True
        )
        
        print("Usuário admin criado com sucesso!")
        print("Username: admin")
        print("Email: admin@admin.com.br")
        print("Senha: 12354")
        
    except Exception as e:
        print(f"Erro ao criar usuário: {str(e)}")
        # Se houver erro, tenta atualizar o usuário existente
        try:
            admin_user = User.objects.get(username='admin')
            admin_user.email = 'admin@admin.com.br'
            admin_user.password = make_password('12354')
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.is_active = True
            admin_user.save()
            print("Usuário admin atualizado com sucesso!")
        except Exception as e:
            print(f"Erro ao atualizar usuário: {str(e)}")

if __name__ == '__main__':
    create_admin_user() 