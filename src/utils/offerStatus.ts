import { EnergyOffer } from '../types';

export const getOfferStatus = (offer: EnergyOffer): {
  status: 'activa' | 'expirada' | 'pendiente' | 'vendida' | 'cancelada';
  statusText: string;
  statusClass: string;
} => {
  console.log('Checking offer status:', offer);
  
  if (offer.status) {
    console.log('Using predefined status:', offer.status);
    return {
      status: offer.status,
      statusText: offer.status.charAt(0).toUpperCase() + offer.status.slice(1),
      statusClass: getStatusColor(offer.status)
    };
  }

  const now = new Date();
  const availableFrom = new Date(offer.availableFrom);
  const availableTo = new Date(offer.availableTo);

  console.log('Time comparison:', {
    now: now.toISOString(),
    availableFrom: availableFrom.toISOString(),
    availableTo: availableTo.toISOString()
  });

  if (now > availableTo) {
    console.log('Offer expired');
    return {
      status: 'expirada',
      statusText: 'Expirada',
      statusClass: 'bg-red-100 text-red-800'
    };
  }

  if (now < availableFrom) {
    console.log('Offer pending');
    return {
      status: 'pendiente',
      statusText: 'Pendiente',
      statusClass: 'bg-yellow-100 text-yellow-800'
    };
  }

  console.log('Offer active');
  return {
    status: 'activa',
    statusText: 'Activa',
    statusClass: 'bg-green-100 text-green-800'
  };
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'activa':
      return 'bg-green-100 text-green-800';
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800';
    case 'vendida':
      return 'bg-blue-100 text-blue-800';
    case 'cancelada':
    case 'expirada':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'activa':
      return 'bg-green-400/10 text-green-400 ring-green-400/20';
    case 'pendiente':
      return 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/20';
    case 'vendida':
      return 'bg-blue-400/10 text-blue-400 ring-blue-400/20';
    case 'cancelada':
    case 'expirada':
      return 'bg-red-400/10 text-red-400 ring-red-400/20';
    default:
      return 'bg-gray-400/10 text-gray-400 ring-gray-400/20';
  }
}; 