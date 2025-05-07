import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para respostas
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Erro 401 (Não autorizado)
            if (error.response.status === 401) {
                // Limpar dados de autenticação
                localStorage.removeItem('token');
                window.location.href = '/access-profile';
            }
            
            // Erro 403 (Proibido)
            if (error.response.status === 403) {
                console.error('Acesso proibido:', error.response.data);
            }
            
            // Erro 500 (Erro interno do servidor)
            if (error.response.status === 500) {
                console.error('Erro interno do servidor:', error.response.data);
            }
        }
        return Promise.reject(error);
    }
);

export default api; 