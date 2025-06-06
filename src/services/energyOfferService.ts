import { EnergyOffer } from '../types';
import { offersAPI } from './api';

export interface CreateOfferData {
  energyAmount: number;
  pricePerUnit: number;
  location: string;
  type: 'solar' | 'hidráulica' | 'biomasa' | 'eólica';
  availableFrom: string;
  availableTo: string;
}

export const energyOfferService = {
  async getOffers(): Promise<EnergyOffer[]> {
    return offersAPI.getOffers();
  },

  async createOffer(offerData: CreateOfferData): Promise<EnergyOffer> {
    try {
      console.log('Datos de la oferta a crear:', offerData);
      const offer = await offersAPI.createOffer(offerData);
      console.log('Oferta creada:', offer);
      return offer;
    } catch (error) {
      console.error('Error en energyOfferService.createOffer:', error);
      throw error;
    }
  },

  async updateOfferPrice(offerId: string, newPrice: number): Promise<EnergyOffer> {
    return offersAPI.updateOfferPrice(offerId, newPrice);
  }
}; 