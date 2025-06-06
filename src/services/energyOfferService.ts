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
    return offersAPI.createOffer(offerData);
  },

  async updateOfferPrice(offerId: string, newPrice: number): Promise<EnergyOffer> {
    return offersAPI.updateOfferPrice(offerId, newPrice);
  }
}; 