import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from logistics.models import Vehicle

# Lista de veículos para teste
vehicles = [
    {
        'model': 'Toyota Corolla',
        'color': '#FF0000',  # Vermelho
        'chassi': 'ABC1234'
    },
    {
        'model': 'Honda Civic',
        'color': '#0000FF',  # Azul
        'chassi': 'DEF5678'
    },
    {
        'model': 'Volkswagen Golf',
        'color': '#FFFFFF',  # Branco
        'chassi': 'GHI9012'
    },
    {
        'model': 'Ford Focus',
        'color': '#000000',  # Preto
        'chassi': 'JKL3456'
    },
    {
        'model': 'Chevrolet Onix',
        'color': '#808080',  # Cinza
        'chassi': 'MNO7890'
    }
]

# Criar os veículos
for vehicle_data in vehicles:
    vehicle = Vehicle.objects.create(**vehicle_data)
    print(f"Veículo criado: {vehicle}")

print("\nVeículos de teste criados com sucesso!") 