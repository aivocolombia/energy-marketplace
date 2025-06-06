import React, { useState, useEffect } from 'react';
import { EnergyOffer } from '../types';
import { formatCurrency } from '../utils/format';

interface OfferModalProps {
  offer: EnergyOffer;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPurchase: (amount: number) => Promise<void>;
}

export default function OfferModal({ offer, isOpen, onClose, onConfirmPurchase }: OfferModalProps) {
  const [purchaseAmount, setPurchaseAmount] = useState<number>(offer.energyAmount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPurchaseAmount(offer.energyAmount);
  }, [offer]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseAmount || purchaseAmount <= 0 || purchaseAmount > offer.energyAmount) {
      setError('La cantidad debe ser mayor a 0 y no puede exceder la cantidad disponible');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onConfirmPurchase(purchaseAmount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la compra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Detalles de la Oferta
              </h3>

              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cantidad disponible
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{offer.energyAmount} kWh</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Precio por kWh
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(offer.pricePerUnit)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Vendedor
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{offer.seller.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ubicación
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{offer.location}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de energía
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{offer.type}</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Cantidad a comprar (kWh)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      value={purchaseAmount}
                      onChange={(e) => {
                        const value = Math.min(offer.energyAmount, Math.max(0, Number(e.target.value)));
                        setPurchaseAmount(value);
                        setError(null);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    />
                  </div>

                  {error && (
                    <div className="mt-2 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {isLoading ? 'Procesando...' : 'Confirmar Compra'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 