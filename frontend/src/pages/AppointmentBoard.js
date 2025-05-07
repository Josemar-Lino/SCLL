import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AppointmentBoard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('today'); // today, week, all

  useEffect(() => {
    fetchAppointments();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = '/api/appointments/';
      const params = new URLSearchParams();
      
      if (filter === 'today') {
        const today = format(new Date(), 'yyyy-MM-dd');
        params.append('date', today);
      } else if (filter === 'week') {
        const today = new Date();
        const weekStart = format(today, 'yyyy-MM-dd');
        const weekEnd = format(new Date(today.setDate(today.getDate() + 7)), 'yyyy-MM-dd');
        params.append('date_start', weekStart);
        params.append('date_end', weekEnd);
      }
      
      const response = await api.get(url, { params });
      setAppointments(response.data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      setError('Erro ao carregar agendamentos. Por favor, tente novamente.');
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'in_progress':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return priority;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Painel de Agendamentos</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('today')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'today'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Hoje
              </button>
              <button
                onClick={() => setFilter('week')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'week'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Esta Semana
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Todos
              </button>
            </div>
          </div>
        </div>

        {/* Grid de Agendamentos */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchAppointments}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Tentar Novamente
              </button>
            </div>
          ) : loading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando agendamentos...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">Nenhum agendamento encontrado</p>
            </div>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {appointment.client}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {format(new Date(appointment.appointment_date), "dd 'de' MMMM 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {getStatusText(appointment.status)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className={getPriorityColor(appointment.priority)}>
                        Prioridade: {getPriorityText(appointment.priority)}
                      </span>
                    </div>

                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Veículo:</span>{' '}
                        {appointment.vehicle?.model} - {appointment.vehicle?.color}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Preparador:</span>{' '}
                        {appointment.preparer
                          ? `${appointment.preparer.user.first_name} ${appointment.preparer.user.last_name}`
                          : 'Não atribuído'}
                      </p>
                    </div>

                    {appointment.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Observações:</span>{' '}
                          {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentBoard; 