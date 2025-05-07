import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [preparers, setPreparers] = React.useState([]);
  const [vehicles, setVehicles] = React.useState([]);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();

  React.useEffect(() => {
    fetchPreparers();
    fetchVehicles();
  }, []);

  const fetchPreparers = async () => {
    try {
      console.log('Buscando preparadores para filial:', user?.branch);
      const response = await api.get('/api/users/', {
        params: {
          branch: user?.branch,
          is_preparer: true
        }
      });
      console.log('Preparadores carregados:', response.data);
      setPreparers(response.data);
    } catch (error) {
      console.error('Erro ao carregar preparadores:', error);
      toast.error('Erro ao carregar preparadores');
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/api/vehicles/');
      setVehicles(response.data);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      toast.error('Erro ao carregar veículos');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const appointmentData = {
        ...data,
        branch: user?.branch,
        estimated_duration: '02:00:00', // 2 horas por padrão
        priority: false
      };

      console.log('Enviando dados do agendamento:', appointmentData);
      await api.post('/api/appointments/', appointmentData);
      toast.success('Agendamento criado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Agendamento</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700">Data do Agendamento</label>
            <input
              type="datetime-local"
              {...register('appointment_date', { required: 'Data é obrigatória' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.appointment_date && (
              <p className="mt-1 text-sm text-red-600">{errors.appointment_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Vendedor</label>
            <input
              type="text"
              {...register('seller', { required: 'Vendedor é obrigatório' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.seller && (
              <p className="mt-1 text-sm text-red-600">{errors.seller.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <input
              type="text"
              {...register('client', { required: 'Cliente é obrigatório' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.client && (
              <p className="mt-1 text-sm text-red-600">{errors.client.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Telefone do Cliente</label>
            <input
              type="tel"
              {...register('client_phone')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email do Cliente</label>
            <input
              type="email"
              {...register('client_email')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Veículo</label>
            <select
              {...register('vehicle_id', { required: 'Veículo é obrigatório' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Selecione um veículo</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.model} - {vehicle.color} - {vehicle.chassi}
                </option>
              ))}
            </select>
            {errors.vehicle_id && (
              <p className="mt-1 text-sm text-red-600">{errors.vehicle_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Preparador</label>
            <select
              {...register('preparer_id', { required: 'Preparador é obrigatório' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Selecione um preparador</option>
              {preparers.map((preparer) => (
                <option key={preparer.id} value={preparer.id}>
                  {preparer.user?.first_name} {preparer.user?.last_name} - {preparer.employee_id}
                </option>
              ))}
            </select>
            {errors.preparer_id && (
              <p className="mt-1 text-sm text-red-600">{errors.preparer_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm; 