import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'logistics.settings')
django.setup()

from django.contrib.auth.models import User
from django.db import IntegrityError

def create_superuser():
    try:
        User.objects.create_superuser(
            username='admin',
            email='admin@admin.com.br',
            password='12354'
        )
        print("Superuser created successfully!")
        print("Username: admin")
        print("Email: admin@admin.com.br")
        print("Password: 12354")
    except IntegrityError:
        print("User 'admin' already exists.")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == '__main__':
    create_superuser() 