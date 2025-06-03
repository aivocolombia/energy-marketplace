import { useState } from 'react';
import { EnergyOffer } from '../types';
import { formatCurrency } from '../utils/format';
import { getOfferStatus } from '../utils/offerStatus';

interface OfferModalProps {
  offer: EnergyOffer;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPurchase: (amount: number) => Promise<void>;
}

export default function OfferModal({ offer, isOpen, onClose, onConfirmPurchase }: OfferModalProps) {
  const [purchaseAmount, setPurchaseAmount] = useState(offer.energyAmount);
  const [isLoading, setIsLoading] = useState(false);
  const offerStatus = getOfferStatus(offer);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      await onConfirmPurchase(purchaseAmount);
      onClose();
    } catch (error) {
      console.error('Error al procesar la compra:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {offerStatus.status === 'completed' ? 'Detalles de la Transacción' : 'Detalles de la Oferta'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {offerStatus.status === 'completed' ? (
              // Vista de transacción completada
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Comprador:</span> {offer.buyer?.name || 'No disponible'}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Fecha de compra:</span>{' '}
                  {new Date(offer.completedAt || '').toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Cantidad:</span> {offer.energyAmount} kWh
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Precio total:</span>{' '}
                  {formatCurrency(offer.energyAmount * offer.pricePerUnit)}
                </p>
              </div>
            ) : offerStatus.status === 'expired' ? (
              // Vista de oferta expirada
              <div className="text-center py-4">
                <div className="text-red-600 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium">Esta oferta ha expirado</p>
                <p className="text-gray-500 mt-1">
                  La oferta estuvo disponible hasta el{' '}
                  {new Date(offer.availableTo).toLocaleDateString()}
                </p>
              </div>
            ) : offerStatus.status === 'active' ? (
              // Vista de compra para oferta activa
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cantidad disponible
                    </label>
                    <p className="mt-1 text-sm text-gray-500">{offer.energyAmount} kWh</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Precio por kWh
                    </label>
                    <p className="mt-1 text-sm text-gray-500">{formatCurrency(offer.pricePerUnit)}</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Cantidad a comprar (kWh)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(Math.min(offer.energyAmount, Math.max(0, Number(e.target.value))))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>

                <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-3 mt-6">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-900">
                      Total a pagar: {formatCurrency(purchaseAmount * offer.pricePerUnit)}
                    </p>
                    <button
                      onClick={handlePurchase}
                      disabled={isLoading || purchaseAmount <= 0}
                      className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? 'Procesando...' : 'Confirmar Compra'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
} 