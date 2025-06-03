import axios from 'axios';
import type { AuthResponse, User, EnergyOffer, Transaction } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Cambiar según tu backend
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Mock de respuesta
    return {
      token: 'mock-token',
      user: {
        id: '1',
        email,
        name: 'Usuario Demo',
        role: 'buyer',
      },
    };
  },
  register: async (userData: Partial<User>): Promise<AuthResponse> => {
    // Mock de respuesta
    return {
      token: 'mock-token',
      user: {
        id: '1',
        email: userData.email!,
        name: userData.name!,
        role: userData.role!,
      },
    };
  },
};

export const offersAPI = {
  getOffers: async (): Promise<EnergyOffer[]> => {
    // Mock de respuesta
    return [
      {
        id: '1',
        sellerId: '2',
        quantity: 100,
        pricePerKwh: 0.15,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'active',
      },
    ];
  },
  createOffer: async (offer: Partial<EnergyOffer>): Promise<EnergyOffer> => {
    // Mock de respuesta
    return {
      id: Math.random().toString(),
      sellerId: '2',
      ...offer,
      status: 'active',
    } as EnergyOffer;
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