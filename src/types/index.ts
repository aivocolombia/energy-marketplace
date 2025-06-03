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
  availableFrom: Date;
  availableTo: Date;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  type: 'solar' | 'wind' | 'hydro' | 'other';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export type Transaction = {
  id: string;
  offerId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalPrice: number;
  date: string;
}; 