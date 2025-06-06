import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { offersAPI } from '../services/api';
import type { EnergyOffer } from '../types';
import Layout from '../components/Layout';
import { formatCurrency } from '../utils/format';
import { getOfferStatus } from '../utils/offerStatus';
import OfferModal from '../components/OfferModal';
import { socket } from '../services/socket';
import PublishOfferModal from '../components/sales/PublishOfferModal';
import { energyOfferService } from '../services/energyOfferService';

interface PublishFormData {
  energyAmount: string;
  pricePerUnit: string;
  location: string;
  type: 'solar' | 'hidráulica' | 'biomasa' | 'eólica';
  availableFrom: Date | null;
  availableTo: Date | null;
}

export default function Dashboard() {
  const [offers, setOffers] = useState<EnergyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<EnergyOffer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadOffers();

    socket.on('newOffer', (offer: EnergyOffer) => {
      console.log('New offer received:', offer);
      setOffers(prevOffers => [offer, ...prevOffers]);
    });

    socket.on('updateOffer', (updatedOffer: EnergyOffer) => {
      console.log('Updated offer received:', updatedOffer);
      setOffers(prevOffers => 
        prevOffers.map(offer => 
          offer._id === updatedOffer._id ? updatedOffer : offer
        )
      );
    });

    socket.on('deleteOffer', (offerId: string) => {
      console.log('Delete offer received:', offerId);
      setOffers(prevOffers => 
        prevOffers.filter(offer => offer._id !== offerId)
      );
    });

    return () => {
      socket.off('newOffer');
      socket.off('updateOffer');
      socket.off('deleteOffer');
    };
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await energyOfferService.getOffers();
      console.log('Loaded offers:', data);
      setOffers(data);
    } catch (error) {
      console.error('Error al cargar ofertas:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar las ofertas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (offer: EnergyOffer, e: React.MouseEvent) => {
    e.preventDefault();
    const canBuy = user?.role === 'buyer' && offer.status === 'activa' && offer.seller._id !== user._id;
    
    if (canBuy) {
      setSelectedOffer(offer);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOffer(null);
  };

  const handleBuyOffer = async (amount: number) => {
    if (!selectedOffer || !user) return;
    
    try {
      if (user.role !== 'buyer') {
        throw new Error('Solo los compradores pueden realizar compras de energía');
      }
      
      if (selectedOffer.seller._id === user._id) {
        throw new Error('No puede comprar su propia oferta');
      }
      
      await offersAPI.purchaseOffer(selectedOffer._id, amount);
      await loadOffers();
      handleCloseModal();
      alert('Compra realizada con éxito');
    } catch (error) {
      console.error('Error al comprar la oferta:', error);
      throw error;
    }
  };

  const handleOfferCreated = async (newOffer: EnergyOffer) => {
    try {
      if (!user) {
        throw new Error('Debe iniciar sesión para publicar ofertas');
      }
      
      if (user.role !== 'seller') {
        throw new Error('Solo los vendedores pueden publicar ofertas');
      }
      
      await energyOfferService.createOffer(newOffer);
      await loadOffers();
      setIsPublishModalOpen(false);
    } catch (error) {
      console.error('Error al crear oferta:', error);
      alert(error instanceof Error ? error.message : 'Error al crear la oferta');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-600">Cargando ofertas...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Ofertas de Energía</h1>
          {user?.role === 'seller' && (
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            >
              Publicar Oferta
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => {
            const canBuy = user?.role === 'buyer' && offer.status === 'activa' && offer.seller._id !== user._id;

            return (
              <div
                key={offer._id}
                onClick={(e) => handleOpenModal(offer, e)}
                className={`bg-white overflow-hidden shadow-lg rounded-lg divide-y divide-gray-200 transition-all duration-300 ${
                  canBuy ? 'hover:shadow-xl cursor-pointer hover:bg-gray-50' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {offer.energyAmount} kWh
                        </h3>
                        <p className="text-sm text-gray-500">
                          Precio: {formatCurrency(offer.pricePerUnit)}/kWh
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Ubicación:</span> {offer.location}
                        </p>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Tipo:</span> {offer.type}
                        </p>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Vendedor:</span> {offer.seller.name}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      offer.status === 'activa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                    </span>
                  </div>
                </div>
                {canBuy && (
                  <div className="px-4 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(offer, e);
                      }}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      Comprar Energía
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {offers.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay ofertas disponibles en este momento</p>
          </div>
        )}

        <PublishOfferModal
          open={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          onSuccess={handleOfferCreated}
        />

        {selectedOffer && (
          <OfferModal
            key={`modal-${selectedOffer._id}-${isModalOpen}`}
            offer={selectedOffer}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onConfirmPurchase={handleBuyOffer}
          />
        )}
      </div>
    </Layout>
  );
} 