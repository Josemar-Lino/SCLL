import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const SupervisorAppointment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preparers, setPreparers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showPreparerModal, setShowPreparerModal] = useState(false);
  const [newPreparer, setNewPreparer] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    employee_id: ''
  });
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();

  const watchVehicleId = watch('vehicle_id');

  useEffect(() => {
    fetchPreparers();
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (watchVehicleId) {
      const selectedVehicle = vehicles.find(v => v.id === parseInt(watchVehicleId));
      if (selectedVehicle) {
        setValue('model', selectedVehicle.model);
        setValue('color', selectedVehicle.color);
        setValue('chassi', selectedVehicle.chassi);
      }
    }
  }, [watchVehicleId, vehicles, setValue]);

  const fetchPreparers = async () => {
    try {
      console.log('Iniciando busca de preparadores...');
      console.log('Branch do usuário:', user?.branch);
      
      const response = await api.get('/api/users/', {
        params: {
          branch: user?.branch,
          is_preparer: true
        }
      });
      
      console.log('Resposta da API:', response.data);
      
      if (!Array.isArray(response.data)) {
        console.error('Dados recebidos não são um array:', response.data);
        toast.error('Formato de dados inválido');
        return;
      }
      
      setPreparers(response.data);
      console.log('Preparadores carregados com sucesso:', response.data.length);
    } catch (error) {
      console.error('Erro detalhado ao carregar preparadores:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.message || 'Erro ao carregar preparadores');
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

  const handleNewPreparerChange = (e) => {
    const { name, value } = e.target;
    setNewPreparer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewPreparerSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/users/', {
        ...newPreparer,
        branch: user?.branch,
        is_preparer: true
      });
      
      console.log('Novo preparador criado:', response.data);
      toast.success('Preparador cadastrado com sucesso!');
      setShowPreparerModal(false);
      setNewPreparer({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        employee_id: ''
      });
      fetchPreparers();
    } catch (error) {
      console.error('Erro ao cadastrar preparador:', error);
      toast.error(error.response?.data?.message || 'Erro ao cadastrar preparador');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (!user?.branch) {
        toast.error('Filial não identificada. Por favor, faça login novamente.');
        navigate('/access-profile');
        return;
      }

      // Validar data do agendamento
      const appointmentDateTime = new Date(data.appointment_date);
      const now = new Date();
      if (appointmentDateTime < now) {
        toast.error('A data do agendamento não pode ser no passado.');
        return;
      }

      // Separar data e hora do campo datetime-local
      const [date, time] = data.appointment_date.split('T');
      
      // Formatar a data para YYYY-MM-DD
      const formattedDate = date.split('-').join('-');
      
      const appointmentData = {
        appointment_date: formattedDate,
        time: time,
        seller: data.seller,
        client: data.client,
        client_phone: data.client_phone || '',
        client_email: data.client_email || '',
        vehicle_id: parseInt(data.vehicle_id),
        preparer_id: data.preparer ? parseInt(data.preparer) : null,
        branch_id: parseInt(user.branch),
        notes: data.notes || '',
        estimated_duration: '01:00:00', // 1 hora por padrão
        priority: 'medium' // Prioridade média por padrão
      };

      // Validar branch_id
      if (!appointmentData.branch_id || isNaN(appointmentData.branch_id)) {
        toast.error('ID da filial inválido.');
        return;
      }

      console.log('Dados do formulário:', data);
      console.log('Dados formatados para envio:', appointmentData);
      
      const response = await api.post('/api/appointments/', appointmentData);
      console.log('Resposta da API:', response.data);
      
      toast.success('Agendamento criado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro detalhado ao criar agendamento:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Tratamento específico para diferentes tipos de erro
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Se houver campos específicos com erro
          Object.keys(errorData).forEach(field => {
            toast.error(`Erro no campo ${field}: ${errorData[field]}`);
          });
        } else {
          toast.error(errorData || 'Dados inválidos no formulário');
        }
      } else if (error.response?.status === 401) {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        navigate('/access-profile');
      } else if (error.response?.status === 403) {
        toast.error('Você não tem permissão para criar agendamentos.');
      } else if (error.response?.status === 404) {
        toast.error('Recurso não encontrado. Verifique os dados informados.');
      } else if (error.response?.status === 409) {
        toast.error('Conflito de horário. Por favor, escolha outro horário.');
      } else if (!error.response) {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        toast.error('Erro ao criar agendamento. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Novo Agendamento (Supervisor)</h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Data do Agendamento</label>
            <input
              type="datetime-local"
              {...register('appointment_date', { required: 'Data é obrigatória' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email do Cliente</label>
                      <input
                        type="email"
                        {...register('client_email')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Veículo</label>
                      <select
                        {...register('vehicle_id', { required: 'Veículo é obrigatório' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Modelo</label>
                        <input
                          type="text"
                          {...register('model')}
                          disabled
                          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cor</label>
            <input
              type="text"
                          {...register('color')}
                          disabled
                          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
                      </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Chassi</label>
            <input
              type="text"
                        {...register('chassi')}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
                      <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Preparador</label>
                        <button
                          type="button"
                          onClick={() => setShowPreparerModal(true)}
                          className="text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          + Novo Preparador
                        </button>
                      </div>
            <select
              {...register('preparer', { required: 'Preparador é obrigatório' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Selecione um preparador</option>
              {preparers.map((preparer) => (
                <option key={preparer.id} value={preparer.id}>
                            {preparer.user?.first_name || ''} {preparer.user?.last_name || ''} - {preparer.employee_id}
                </option>
              ))}
            </select>
            {errors.preparer && (
              <p className="mt-1 text-sm text-red-600">{errors.preparer.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea
              {...register('notes')}
              rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
                    </div>
          </div>

                  <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
          </div>
        </div>
      </div>

      {/* Modal de Novo Preparador */}
      {showPreparerModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Novo Preparador</h3>
              <button
                type="button"
                onClick={() => setShowPreparerModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Fechar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleNewPreparerSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    name="first_name"
                    value={newPreparer.first_name}
                    onChange={handleNewPreparerChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sobrenome</label>
                  <input
                    type="text"
                    name="last_name"
                    value={newPreparer.last_name}
                    onChange={handleNewPreparerChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newPreparer.email}
                  onChange={handleNewPreparerChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Usuário</label>
                <input
                  type="text"
                  name="username"
                  value={newPreparer.username}
                  onChange={handleNewPreparerChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Senha</label>
                <input
                  type="password"
                  name="password"
                  value={newPreparer.password}
                  onChange={handleNewPreparerChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Matrícula</label>
                <input
                  type="text"
                  name="employee_id"
                  value={newPreparer.employee_id}
                  onChange={handleNewPreparerChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPreparerModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorAppointment; 