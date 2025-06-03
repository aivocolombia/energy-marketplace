import { EnergyOffer } from '../types';

export const getOfferStatus = (offer: EnergyOffer): {
  status: 'active' | 'expired' | 'pending' | 'completed' | 'cancelled';
  statusText: string;
  statusClass: string;
} => {
  const now = new Date();
  const availableFrom = new Date(offer.availableFrom);
  const availableTo = new Date(offer.availableTo);

  // Si la oferta está marcada como completada (vendida)
  if (offer.status === 'completed') {
    return {
      status: 'completed',
      statusText: 'Vendida',
      statusClass: 'bg-blue-100 text-blue-800'
    };
  }

  // Si la oferta está cancelada
  if (offer.status === 'cancelled') {
    return {
      status: 'cancelled',
      statusText: 'Cancelada',
      statusClass: 'bg-gray-100 text-gray-800'
    };
  }

  // Si la fecha de fin ya pasó
  if (now > availableTo) {
    return {
      status: 'expired',
      statusText: 'Expirada',
      statusClass: 'bg-red-100 text-red-800'
    };
  }

  // Si aún no llega la fecha de inicio
  if (now < availableFrom) {
    return {
      status: 'pending',
      statusText: 'Pendiente',
      statusClass: 'bg-yellow-100 text-yellow-800'
    };
  }

  // Si está dentro del rango de fechas y activa
  return {
    status: 'active',
    statusText: 'Activa',
    statusClass: 'bg-green-100 text-green-800'
  };
}; 