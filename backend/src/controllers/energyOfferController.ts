import { Request, Response } from 'express';
import { EnergyOffer } from '../models/EnergyOffer';
import { Transaction } from '../models/Transaction';
import { io } from '../index';
import { AuthRequest } from '../types/express';
import mongoose from 'mongoose';

export const createOffer = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const { energyAmount, pricePerUnit, location, availableFrom, availableTo, type } = req.body;

    if (!energyAmount || energyAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad de energía debe ser mayor que 0'
      });
    }

    if (!pricePerUnit || pricePerUnit <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio por unidad debe ser mayor que 0'
      });
    }

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'La ubicación es requerida'
      });
    }

    if (!type || !['solar', 'eólica', 'hidráulica', 'biomasa'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de energía no válido'
      });
    }

    const fromDate = new Date(availableFrom);
    const toDate = new Date(availableTo);
    const now = new Date();

    const normalizedFromDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    const normalizedToDate = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
    const normalizedNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (normalizedFromDate < normalizedNow) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de inicio debe ser posterior o igual a la fecha actual'
      });
    }

    if (normalizedToDate < normalizedFromDate) {
      return res.status(400).json({
        success: false,
        message: 'La fecha final debe ser posterior o igual a la fecha de inicio'
      });
    }
    
    const offer = new EnergyOffer({
      seller: req.userId,
      energyAmount,
      pricePerUnit,
      location,
      availableFrom,
      availableTo,
      type,
      status: 'activa'
    });

    await offer.save({ session });
    await offer.populate('seller', 'name email');

    const transaction = new Transaction({
      seller: req.userId,
      buyer: req.userId, 
      offer: offer._id,
      energyAmount,
      pricePerUnit,
      totalPrice: energyAmount * pricePerUnit,
      status: 'en venta',
      type
    });

    await transaction.save({ session });
    await transaction.populate('seller', 'name email');

    await session.commitTransaction();

    io.emit('newOffer', offer);
    io.emit('newTransaction', transaction);

    res.status(201).json({
      success: true,
      data: {
        offer,
        transaction
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error al crear oferta:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error al crear la oferta'
    });
  } finally {
    session.endSession();
  }
};

export const getAllOffers = async (req: Request, res: Response) => {
  try {
    const offers = await EnergyOffer.find()
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: offers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las ofertas'
    });
  }
};

export const getActiveOffers = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    const offers = await EnergyOffer.find({ 
      status: 'activa',
      availableFrom: { $lte: now },
      availableTo: { $gte: now }
    })
    .populate('seller', 'name email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: offers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las ofertas'
    });
  }
};

export const updateOfferPrice = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const { offerId } = req.params;
    const { newPrice } = req.body;

    const offer = await EnergyOffer.findById(offerId).populate('seller', 'name email');
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no encontrada'
      });
    }

    if (offer.seller._id.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para actualizar esta oferta'
      });
    }

    offer.pricePerUnit = newPrice;
    await offer.save();

    io.emit('updateOffer', offer);

    res.json({
      success: true,
      data: offer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar el precio'
    });
  }
};

export const getSellerOffers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const offers = await EnergyOffer.find({ seller: req.userId })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: offers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las ofertas'
    });
  }
};

export const buyOffer = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const { offerId } = req.params;
    const { amount } = req.body;

    console.log('Iniciando compra:', { offerId, amount, buyerId: req.userId });

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser mayor que 0'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de oferta inválido'
      });
    }

    const offer = await EnergyOffer.findById(offerId).populate('seller', 'name email');
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no encontrada'
      });
    }

    console.log('Oferta encontrada:', offer);

    if (offer.status !== 'activa') {
      return res.status(400).json({
        success: false,
        message: 'La oferta no está activa'
      });
    }

    if (offer.seller._id.toString() === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes comprar tu propia oferta'
      });
    }

    if (amount > offer.energyAmount) {
      return res.status(400).json({
        success: false,
        message: 'Cantidad solicitada no disponible'
      });
    }

    const now = new Date();
    if (now < offer.availableFrom || now > offer.availableTo) {
      return res.status(400).json({
        success: false,
        message: 'La oferta no está disponible en este momento'
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingTransaction = await Transaction.findOne({ offer: offerId, status: 'en venta' });
      if (existingTransaction) {
        existingTransaction.status = 'vendida';
        existingTransaction.buyer = req.userId;
        await existingTransaction.save({ session });
      }

      offer.status = 'vendida';
      await offer.save({ session });

      await session.commitTransaction();
      
      if (existingTransaction) {
        await existingTransaction.populate('buyer seller', 'name email');
      }

      io.emit('updateOffer', offer);
      io.emit('updateTransaction', existingTransaction);

      console.log('Transacción completada exitosamente');

      res.json({
        success: true,
        data: {
          transaction: existingTransaction,
          offer
        }
      });
    } catch (error) {
      await session.abortTransaction();
      console.error('Error en la transacción:', error);
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Error al procesar la compra:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error al procesar la compra'
    });
  }
}; 