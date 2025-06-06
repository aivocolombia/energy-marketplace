export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  message?: string;
}

export interface EnergyOffer {
  _id: string;
  seller: User;
  buyer?: User;
  energyAmount: number;
  pricePerUnit: number;
  location: string;
  type: 'solar' | 'hidráulica' | 'biomasa' | 'eólica';
  status: 'activa' | 'pendiente' | 'vendida' | 'cancelada';
  availableFrom: string;
  availableTo: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface Transaction {
  _id: string;
  seller: User;
  buyer: User;
  offer: EnergyOffer;
  energyAmount: number;
  pricePerUnit: number;
  totalPrice: number;
  type: 'solar' | 'hidráulica' | 'biomasa' | 'eólica';
  status: 'pendiente' | 'completada' | 'cancelada';
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface PriceUpdate {
  type: 'solar' | 'hidráulica' | 'biomasa' | 'eólica';
  location: string;
  newPrice: number;
  timestamp: string;
} 