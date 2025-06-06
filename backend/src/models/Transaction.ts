import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnergyOffer',
    required: true
  },
  energyAmount: {
    type: Number,
    required: true,
    min: 0
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['solar', 'eólica', 'hidráulica', 'biomasa'],
    required: true
  },
  status: {
    type: String,
    enum: ['en venta', 'vendida', 'cancelada'],
    default: 'en venta'
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

transactionSchema.index({ seller: 1, createdAt: -1 });
transactionSchema.index({ buyer: 1, createdAt: -1 });
transactionSchema.index({ offer: 1 });

export const Transaction = mongoose.model('Transaction', transactionSchema); 