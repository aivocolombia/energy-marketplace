import axios from 'axios';
import { EnergyOffer, AuthResponse, ApiResponse, Transaction } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name: string, email: string, password: string, role: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  },
};

export const offersAPI = {
  getOffers: async (): Promise<EnergyOffer[]> => {
    const response = await api.get<ApiResponse<EnergyOffer[]>>('/offers/active');
    return response.data.data || [];
  },

  getMyOffers: async (): Promise<EnergyOffer[]> => {
    const response = await api.get<ApiResponse<EnergyOffer[]>>('/offers/my-offers');
    return response.data.data || [];
  },

  createOffer: async (offerData: Partial<EnergyOffer>): Promise<EnergyOffer> => {
    const response = await api.post<ApiResponse<EnergyOffer>>('/offers/create', offerData);
    return response.data.data!;
  },

  updateOfferPrice: async (offerId: string, newPrice: number): Promise<EnergyOffer> => {
    const response = await api.put<ApiResponse<EnergyOffer>>(`/offers/${offerId}/price`, { price: newPrice });
    return response.data.data!;
  },

  purchaseOffer: async (offerId: string, amount: number): Promise<EnergyOffer> => {
    const response = await api.post<ApiResponse<EnergyOffer>>(`/offers/${offerId}/purchase`, { amount });
    return response.data.data!;
  },
};

export const transactionsAPI = {
  getTransactions: async (): Promise<Transaction[]> => {
    // Mock de respuesta
    return [
      {
        id: '1',
        offerId: '1',
        buyerId: '1',
        sellerId: '2',
        quantity: 50,
        totalPrice: 7.5,
        date: new Date().toISOString(),
      },
    ];
  },
}; 