import mongoose from 'mongoose';

const energyOfferSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  type: {
    type: String,
    enum: ['solar', 'eólica', 'hidráulica', 'biomasa'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  availableFrom: {
    type: Date,
    required: true
  },
  availableTo: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['activa', 'vendida', 'cancelada'],
    default: 'activa'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

energyOfferSchema.index({ seller: 1, createdAt: -1 });
energyOfferSchema.index({ status: 1, availableFrom: 1, availableTo: 1 });
energyOfferSchema.index({ type: 1 });

export const EnergyOffer = mongoose.model('EnergyOffer', energyOfferSchema); 