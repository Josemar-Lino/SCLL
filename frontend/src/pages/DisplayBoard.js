import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';

export default function DisplayBoard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/appointments/', {
          params: {
            branch: user.branch,
          },
        });
        setAppointments(response.data);
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
    const interval = setInterval(fetchAppointments, 30000); // Atualiza a cada 30 segundos

    return () => clearInterval(interval);
  }, [user.branch]);

  const getWashDate = (appointmentDate) => {
    return format(addDays(new Date(appointmentDate), 3), 'dd/MM/yyyy', { locale: ptBR });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Agendamentos de Lavagem
        </h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    {appointment.vehicle.model}
                  </h4>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                    {appointment.branch.name}
                  </span>
                </div>

                <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Cor</dt>
                    <dd className="mt-1 text-sm text-gray-900">{appointment.vehicle.color}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Chassi</dt>
                    <dd className="mt-1 text-sm text-gray-900">{appointment.vehicle.chassi}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Data de Lavagem</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {getWashDate(appointment.appointment_date)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Preparador</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {appointment.preparer?.user.username || 'Não atribuído'}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Horário</dt>
                    <dd className="mt-1 text-sm text-gray-900">{appointment.time}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Vendedor</dt>
                    <dd className="mt-1 text-sm text-gray-900">{appointment.seller}</dd>
                  </div>
                </dl>
              </div>
            </div>
          ))}
        </div>

        {appointments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum agendamento encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
} 