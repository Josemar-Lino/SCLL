🚗 Sistema de Controle de Lavagens e Logística de Veículos
Sistema web para gerenciamento logístico de veículos, com funcionalidades de controle de lavagens, agendamentos, entregas e monitoramento em tempo real.

⚙️ Tecnologias Utilizadas

Frontend: React + Tailwind CSS

Backend: Django

Banco de Dados: MySQL

Comunicação em Tempo Real: WebSockets


📁 Estrutura do Projeto


bash
Copiar
Editar
logistica/
├── frontend/         # Aplicação React (interface do usuário)
├── backend/          # API Django (lógica de negócio e banco de dados)
└── README.md


📌 Requisitos


Node.js 16 ou superior

Python 3.8 ou superior

MySQL 8.0 ou superior


🚀 Configuração do Ambiente
🔧 Backend (Django)


Crie e ative um ambiente virtual:

bash
Copiar
Editar
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows
Instale as dependências:

bash
Copiar
Editar
cd backend
pip install -r requirements.txt
Configure o banco de dados e crie o superusuário:

bash
Copiar
Editar
python manage.py migrate
python manage.py createsuperuser
Inicie o servidor:

bash
Copiar
Editar
python manage.py runserver


🎨 Frontend (React)


Instale as dependências:

bash
Copiar
Editar
cd frontend
npm install
Inicie o servidor de desenvolvimento:

bash
Copiar
Editar
npm run dev


✅ Funcionalidades


Autenticação com controle por filial

Cadastro e gestão de agendamentos

Gerenciamento de entregas de veículos

Visualização em tempo real para telões/logística

Cadastro de usuários com diferentes permissões

Administração de múltiplas filiais

📝 Licença

Este projeto está licenciado sob a licença MIT.

Desenvolvido por DEV-JosemarLino
