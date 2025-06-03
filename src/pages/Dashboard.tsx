import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { offersAPI } from '../services/api';
import type { EnergyOffer } from '../types';
import Layout from '../components/Layout';
import { formatCurrency } from '../utils/format';
import { getOfferStatus } from '../utils/offerStatus';
import OfferModal from '../components/OfferModal';
import { socket } from '../services/socket';

export default function Dashboard() {
  const [offers, setOffers] = useState<EnergyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [selectedOffer, setSelectedOffer] = useState<EnergyOffer | null>(null);
  const user = useAuthStore((state) => state.user);
  const carouselRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const SCROLL_SPEED = 0.5; // píxeles por frame (más bajo = más lento)

  const animate = useCallback(() => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    setScrollPosition(prev => {
      let newPosition = prev + SCROLL_SPEED;
      
      // Si llegamos al final, volver al inicio suavemente
      if (newPosition >= maxScroll) {
        newPosition = 0;
      }
      
      return newPosition;
    });

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    loadOffers();

    socket.on('newOffer', (offer: EnergyOffer) => {
      setOffers(prevOffers => [offer, ...prevOffers]);
    });

    socket.on('updateOffer', (updatedOffer: EnergyOffer) => {
      setOffers(prevOffers => 
        prevOffers.map(offer => 
          offer._id === updatedOffer._id ? updatedOffer : offer
        )
      );
    });

    socket.on('deleteOffer', (offerId: string) => {
      setOffers(prevOffers => 
        prevOffers.filter(offer => offer._id !== offerId)
      );
    });

    return () => {
      socket.off('newOffer');
      socket.off('updateOffer');
      socket.off('deleteOffer');
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (offers.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, offers.length]);

  const loadOffers = async () => {
    try {
      const data = await offersAPI.getOffers();
      setOffers(data);
    } catch (err) {
      setError('Error al cargar las ofertas');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyOffer = async (amount: number) => {
    if (!selectedOffer) return;
    
    try {
      const response = await offersAPI.purchaseOffer(selectedOffer._id, amount);
      // Actualizar la oferta en el estado local
      setOffers(prevOffers =>
        prevOffers.map(offer =>
          offer._id === selectedOffer._id ? response : offer
        )
      );
      setSelectedOffer(null);
    } catch (error) {
      console.error('Error al comprar la oferta:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Ofertas de Energía
          </h1>
          {user?.role === 'seller' && (
            <button
              onClick={() => alert('Funcionalidad en desarrollo')}
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

        <div className="relative overflow-hidden">
          <div 
            ref={carouselRef}
            className="flex gap-6 transition-transform duration-1000 ease-linear"
            style={{ 
              transform: `translateX(-${scrollPosition}px)`,
            }}
          >
            {[...offers, ...offers].map((offer, index) => (
              <div
                key={`${offer._id}-${index}`}
                className="flex-none w-[calc(33.333%-1rem)] bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-lg divide-y divide-gray-200 hover:shadow-xl transition-all duration-300 hover:bg-white/90 cursor-pointer"
                onClick={() => setSelectedOffer(offer)}
              >
                <div className="px-4 py-5 sm:p-6">
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
                        <p className="text-sm text-gray-500">
                          Disponible desde: {new Date(offer.availableFrom).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Hasta: {new Date(offer.availableTo).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOfferStatus(offer).statusClass}`}>
                      {getOfferStatus(offer).statusText}
                    </span>
                  </div>
                </div>
                {user?.role === 'buyer' && getOfferStatus(offer).status === 'active' && (
                  <div className="px-4 py-4 sm:px-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOffer(offer);
                      }}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      Comprar Energía
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {offers.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay ofertas disponibles en este momento</p>
            </div>
          )}
        </div>
      </div>

      {selectedOffer && (
        <OfferModal
          offer={selectedOffer}
          isOpen={true}
          onClose={() => setSelectedOffer(null)}
          onConfirmPurchase={handleBuyOffer}
        />
      )}
    </Layout>
  );
} 