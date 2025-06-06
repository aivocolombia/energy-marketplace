import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import mongoose from 'mongoose';
import type { AuthRequest } from '../types/express';

interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  role: 'buyer' | 'seller';
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export const transactionController = {
  async getTransactions(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const user = await User.findById(req.userId) as UserDocument;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      let query = {};
      
      if (user.role === 'buyer') {
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
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const { transactionId } = req.params;
      const user = await User.findById(req.userId) as UserDocument;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      let query: any = { _id: transactionId };
      
      if (user.role === 'buyer') {
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