export type User = {
  id: string;
  email: string;
  role: 'buyer' | 'seller';
  name: string;
};

export type EnergyOffer = {
  id: string;
  sellerId: string;
  quantity: number; // kWh
  pricePerKwh: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'sold' | 'expired';
};

export type Transaction = {
  id: string;
  offerId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalPrice: number;
  date: string;
};

export type AuthResponse = {
  token: string;
  user: User;
}; 