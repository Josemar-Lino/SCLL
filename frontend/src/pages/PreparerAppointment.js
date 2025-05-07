import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const PreparerAppointment = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/api/appointments/');
      setAppointments(response.data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.patch(`/api/appointments/${appointmentId}/`, {
        status: newStatus,
      });
      toast.success('Status atualizado com sucesso');
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Meus Agendamentos</h1>
          
          {loading ? (
            <div className="mt-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando agendamentos...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="mt-8 text-center">
              <p className="text-gray-600">Nenhum agendamento encontrado</p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {appointments.map((appointment) => (
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
                          {new Date(appointment.appointment_date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          appointment.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : appointment.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : appointment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {appointment.status === 'scheduled'
                          ? 'Agendado'
                          : appointment.status === 'in_progress'
                          ? 'Em Andamento'
                          : appointment.status === 'completed'
                          ? 'Concluído'
                          : appointment.status}
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Veículo:</span>{' '}
                        {appointment.vehicle?.model} - {appointment.vehicle?.color}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Prioridade:</span>{' '}
                        {appointment.priority === 'high'
                          ? 'Alta'
                          : appointment.priority === 'medium'
                          ? 'Média'
                          : 'Baixa'}
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

                    <div className="mt-4 flex space-x-2">
                      {appointment.status === 'scheduled' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'in_progress')}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                        >
                          Iniciar
                        </button>
                      )}
                      {appointment.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                          Concluir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreparerAppointment; 