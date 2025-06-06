import axios from 'axios';
import { EnergyOffer, AuthResponse, ApiResponse, Transaction, User } from '../types';
import { API_BASE_URL, CONFIG } from '../config';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: CONFIG.API.TIMEOUT,
  timeoutErrorMessage: 'El servidor tardó demasiado en responder'
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Error en la solicitud:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse['data']> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error en el inicio de sesión');
      }
      
      localStorage.setItem('token', response.data.data.token);
      
      return response.data.data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  register: async (userData: { 
    name: string, 
    email: string, 
    password: string, 
    role: 'buyer' | 'seller' 
  }): Promise<AuthResponse['data']> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error en el registro');
      }
      
      localStorage.setItem('token', response.data.data.token);
      
      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Error en el registro');
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get<ApiResponse<{ user: User }>>('/auth/profile');
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al obtener el perfil');
      }
      return response.data.data.user;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};

export const offersAPI = {
  async getOffers(): Promise<EnergyOffer[]> {
    try {
      const response = await api.get<ApiResponse<EnergyOffer[]>>('/energy-offers/all');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener las ofertas');
      }
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener ofertas:', error);
      throw error;
    }
  },

  async getMyOffers(): Promise<EnergyOffer[]> {
    try {
      const response = await api.get<ApiResponse<EnergyOffer[]>>('/energy-offers/my-offers');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener mis ofertas');
      }
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener mis ofertas:', error);
      throw error;
    }
  },

  async createOffer(offerData: Partial<EnergyOffer>): Promise<EnergyOffer> {
    try {
      const requiredFields = ['energyAmount', 'pricePerUnit', 'location', 'type', 'availableFrom', 'availableTo'] as const;
      const missingFields = requiredFields.filter(field => !(field in offerData));
      
      if (missingFields.length > 0) {
        throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
      }

      const response = await api.post<ApiResponse<{offer: EnergyOffer; transaction: any}>>('/energy-offers/create', {
        ...offerData,
        status: 'activa' 
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al crear la oferta');
      }

      const { offer } = response.data.data;
      if (!offer.seller || !offer.type || !offer.status) {
        throw new Error('La respuesta del servidor no incluye todos los campos necesarios');
      }

      return offer;
    } catch (error) {
      console.error('Error al crear oferta:', error);
      throw error;
    }
  },

  async purchaseOffer(offerId: string, amount: number): Promise<EnergyOffer> {
    try {
      console.log('Purchasing offer:', { offerId, amount });
      const response = await api.post<ApiResponse<EnergyOffer>>(`/energy-offers/${offerId}/purchase`, { 
        amount,
        purchaseDate: new Date().toISOString()
      });
      
      console.log('Purchase response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al comprar la oferta');
      }
      return response.data.data!;
    } catch (error) {
      console.error('Error purchasing offer:', error);
      if (error instanceof Error) {
        if (error.message.includes('permiso')) {
          throw new Error('Solo los compradores pueden realizar compras de energía');
        }
      }
      throw error;
    }
  },

  async updateOfferPrice(offerId: string, newPrice: number): Promise<EnergyOffer> {
    try {
      const response = await api.put<ApiResponse<EnergyOffer>>(`/energy-offers/${offerId}/price`, { 
        price: newPrice 
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar el precio');
      }
      return response.data.data!;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('permiso')) {
          throw new Error('Solo los vendedores pueden actualizar sus ofertas');
        }
      }
      throw error;
    }
  }
};

export const transactionsAPI = {
  async getTransactions(): Promise<Transaction[]> {
    try {
      const response = await api.get<ApiResponse<Transaction[]>>('/transactions');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener las transacciones');
      }
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      throw error;
    }
  },

  async getTransactionDetails(transactionId: string): Promise<Transaction> {
    try {
      const response = await api.get<ApiResponse<Transaction>>(`/transactions/${transactionId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener los detalles de la transacción');
      }
      return response.data.data!;
    } catch (error) {
      console.error('Error al obtener detalles de transacción:', error);
      throw error;
    }
  }
}; 