import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/api/appointments/', {
        params: {
          branch: user?.branch,
        },
      });
      setAppointments(response.data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const getWashDate = (appointmentDate) => {
    const date = new Date(appointmentDate);
    date.setDate(date.getDate() + 3);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Bem-vindo, {user?.first_name || 'Usuário'}! Aqui você pode gerenciar seus agendamentos.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4">
          <Link
            to={user?.is_supervisor ? '/supervisor-appointment' : '/appointment-form'}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Novo Agendamento
          </Link>
        </div>
      </div>

      {/* Seção de Cadastros */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Cadastros
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              to="/branches"
              className="relative block w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50"
            >
              <h3 className="text-lg font-medium text-gray-900">Cadastro de Filial</h3>
              <p className="mt-1 text-sm text-gray-500">
                Gerencie as filiais disponíveis no sistema
              </p>
            </Link>
            <Link
              to="/users"
              className="relative block w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50"
            >
              <h3 className="text-lg font-medium text-gray-900">Cadastro de Usuário</h3>
              <p className="mt-1 text-sm text-gray-500">
                Adicione, edite ou remova usuários do sistema
              </p>
            </Link>
            <Link
              to="/preparers"
              className="relative block w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50"
            >
              <h3 className="text-lg font-medium text-gray-900">Cadastro de Preparador</h3>
              <p className="mt-1 text-sm text-gray-500">
                Gerencie os preparadores do sistema
              </p>
            </Link>
            <Link
              to="/vehicle-form"
              className="relative block w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50"
            >
              <h3 className="text-lg font-medium text-gray-900">Cadastro de Veículo</h3>
              <p className="mt-1 text-sm text-gray-500">
                Adicione e gerencie os veículos do sistema
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Lista de Agendamentos */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Agendamentos Recentes
          </h3>
          <ul className="divide-y divide-gray-200">
            {appointments.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">
                Nenhum agendamento encontrado
              </li>
            ) : (
              appointments.map((appointment) => (
                <li key={appointment.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {appointment.vehicle?.model}
                        </p>
                        <p className="ml-2 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {appointment.vehicle?.color}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {appointment.vehicle?.chassi}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <span className="truncate">
                            Data da Lavagem: {getWashDate(appointment.appointment_date)}
                          </span>
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <span className="truncate">
                            Preparador: {appointment.preparer?.user?.first_name}
                          </span>
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Vendedor: {appointment.seller}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Painel de Agendamentos */}
      <Link
        to="/appointments/board"
        className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
      >
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                Painel de Agendamentos
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Visualize todos os agendamentos em tempo real
              </p>
            </div>
          </div>
        </div>
      </Link>

      {/* Novo Agendamento */}
      {user?.is_supervisor && (
        <Link
          to="/supervisor/appointment"
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Novo Agendamento
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Crie um novo agendamento
                </p>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Cadastro de Veículos */}
      <Link
        to="/vehicle/registration"
        className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
      >
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                Cadastro de Veículos
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Cadastre novos veículos no sistema
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}