import { Request, Response } from 'express';
import EnergyOffer from '../models/EnergyOffer';
import { redisService } from '../services/redis';
import { io } from '../index';

export const energyOfferController = {
  // Crear una nueva oferta
  async createOffer(req: Request, res: Response) {
    try {
      const { energyAmount, pricePerUnit, location, availableFrom, availableTo, type } = req.body;
      
      const offer = new EnergyOffer({
        seller: req.user._id, // Asumiendo que el usuario está en req.user después de la autenticación
        energyAmount,
        pricePerUnit,
        location,
        availableFrom,
        availableTo,
        type,
        status: 'active'
      });

      await offer.save();
      
      // Populate seller information
      await offer.populate('seller', 'name email');
      
      // Cachear la oferta en Redis
      await redisService.cacheOffer(offer._id.toString(), offer);

      // Emitir evento de nueva oferta
      io.emit('newOffer', offer);

      res.status(201).json({
        success: true,
        data: offer
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Obtener todas las ofertas activas
  async getActiveOffers(req: Request, res: Response) {
    try {
      // Intentar obtener ofertas de Redis primero
      const cachedOffers = await redisService.getActiveOffers();
      
      if (cachedOffers && cachedOffers.length > 0) {
        return res.json({
          success: true,
          data: cachedOffers
        });
      }

      // Si no hay en caché, obtener de MongoDB
      const offers = await EnergyOffer.find({ status: 'active' })
        .populate('seller', 'name email')
        .sort({ createdAt: -1 });

      // Cachear las ofertas encontradas
      for (const offer of offers) {
        await redisService.cacheOffer(offer._id.toString(), offer);
      }

      res.json({
        success: true,
        data: offers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Actualizar el precio de una oferta
  async updatePrice(req: Request, res: Response) {
    try {
      const { offerId } = req.params;
      const { newPrice } = req.body;

      const offer = await EnergyOffer.findById(offerId).populate('seller', 'name email');
      
      if (!offer) {
        return res.status(404).json({
          success: false,
          message: 'Oferta no encontrada'
        });
      }

      if (offer.seller._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'No autorizado para actualizar esta oferta'
        });
      }

      offer.pricePerUnit = newPrice;
      await offer.save();

      // Actualizar en Redis y publicar el cambio
      await redisService.updateOfferPrice(offerId, newPrice);
      
      // Emitir evento de actualización
      io.emit('updateOffer', offer);

      res.json({
        success: true,
        data: offer
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Obtener ofertas de un vendedor específico
  async getSellerOffers(req: Request, res: Response) {
    try {
      const offers = await EnergyOffer.find({ seller: req.user._id })
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: offers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}; 