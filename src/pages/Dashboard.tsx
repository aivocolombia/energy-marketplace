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
import OffersCarousel from '../components/OffersCarousel';
import OffersTable from '../components/OffersTable';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<EnergyOffer | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const loadOffers = useCallback(async () => {
    try {
      const fetchedOffers = await offersAPI.getOffers();
      setOffers(fetchedOffers);
      setError(null);
    } catch (err) {
      setError('Error al cargar las ofertas');
      console.error('Error loading offers:', err);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  useEffect(() => {
    socket.on('newOffer', (newOffer: EnergyOffer) => {
      setOffers(prevOffers => [newOffer, ...prevOffers]);
    });

    socket.on('offerUpdated', (updatedOffer: EnergyOffer) => {
      setOffers(prevOffers =>
        prevOffers.map(offer =>
          offer._id === updatedOffer._id ? updatedOffer : offer
        )
      );
    });

    return () => {
      socket.off('newOffer');
      socket.off('offerUpdated');
    };
  }, []);

  const handleOpenModal = (offer: EnergyOffer, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOffer(null);
  };

  const handleBuyOffer = async (offerId: string, amount: number) => {
    try {
      const updatedOffer = await offersAPI.purchaseOffer(offerId, amount);
      setOffers(prevOffers =>
        prevOffers.map(offer =>
          offer._id === updatedOffer._id ? updatedOffer : offer
        )
      );
      handleCloseModal();
    } catch (error) {
      console.error('Error purchasing offer:', error);
      throw error;
    }
  };

  const handleOfferCreated = (newOffer: EnergyOffer) => {
    setOffers(prevOffers => [newOffer, ...prevOffers]);
    setIsPublishModalOpen(false);
  };

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

        <OffersCarousel offers={offers} onOpenModal={handleOpenModal} />

        {offers.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay ofertas disponibles en este momento</p>
          </div>
        )}

        <OffersTable offers={offers} onOpenModal={handleOpenModal} />

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