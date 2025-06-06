import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { IUser } from '../models/User';
import mongoose from 'mongoose';
import { AuthRequest } from '../types/express';

interface AuthRequest extends Request {
  user?: IUser;
  userId?: mongoose.Types.ObjectId;
}

export const transactionController = {
  async getTransactions(req: AuthRequest, res: Response) {
    try {
      if (!req.userId || !req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      let query = {};
      
      if (req.user.role === 'buyer') {
        query = { buyer: req.userId };
      }

      const transactions = await Transaction.find(query)
        .populate('buyer', 'name email')
        .populate('seller', 'name email')
        .populate({
          path: 'offer',
          select: 'energyAmount pricePerUnit type status'
        })
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al obtener las transacciones'
      });
    }
  },

  async getTransactionDetails(req: AuthRequest, res: Response) {
    try {
      if (!req.userId || !req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const { transactionId } = req.params;

      let query: any = { _id: transactionId };
      
      if (req.user.role === 'buyer') {
        query.buyer = req.userId;
      }


      const transaction = await Transaction.findOne(query)
        .populate('buyer', 'name email')
        .populate('seller', 'name email')
        .populate({
          path: 'offer',
          select: 'energyAmount pricePerUnit type status'
        });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transacción no encontrada'
        });
      }

      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('Error al obtener detalles de la transacción:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al obtener los detalles de la transacción'
      });
    }
  }
}; 