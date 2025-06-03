import mongoose from 'mongoose';

export interface IEnergyOffer {
  seller: mongoose.Types.ObjectId;
  energyAmount: number;  // en kWh
  pricePerUnit: number; // precio por kWh
  location: string;
  availableFrom: Date;
  availableTo: Date;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  type: 'solar' | 'wind' | 'hydro' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

const energyOfferSchema = new mongoose.Schema<IEnergyOffer>({
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
    enum: ['active', 'pending', 'completed', 'cancelled'],
    default: 'active'
  },
  type: {
    type: String,
    enum: ['solar', 'hidráulica', 'biomasa', 'solar', 'eólica',],
    required: true
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
energyOfferSchema.index({ status: 1, availableFrom: 1, availableTo: 1 });
energyOfferSchema.index({ seller: 1, status: 1 });
energyOfferSchema.index({ location: 1 });
energyOfferSchema.index({ pricePerUnit: 1 });

const EnergyOffer = mongoose.model<IEnergyOffer>('EnergyOffer', energyOfferSchema);

export default EnergyOffer; 