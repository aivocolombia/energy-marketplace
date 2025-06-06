import React, { useState, useEffect, useRef, useMemo } from 'react';
import { EnergyOffer } from '../types';
import { useAuthStore } from '../store/authStore';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

interface OffersCarouselProps {
  offers: EnergyOffer[];
  onOpenModal: (offer: EnergyOffer, event: React.MouseEvent) => void;
}

const OffersCarousel: React.FC<OffersCarouselProps> = ({ offers, onOpenModal }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const activeOffers = useMemo(() => {
    const now = new Date();
    return offers
      .filter(offer => 
        offer.status === 'activa' && 
        new Date(offer.availableFrom) <= now && 
        new Date(offer.availableTo) >= now
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [offers]);

  useEffect(() => {
    if (!isPaused && activeOffers.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= activeOffers.length) {
            return 0;
          }
          return nextIndex;
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isPaused, activeOffers.length]);

  if (activeOffers.length === 0) {
    return null;
  }

  const translateX = -currentIndex * (100 / Math.min(3, activeOffers.length));

  return (
    <div className="relative overflow-hidden">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Ofertas Activas</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : activeOffers.length - 1))}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentIndex(prev => (prev < activeOffers.length - 1 ? prev + 1 : 0))}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            {isPaused ? (
              <PlayIcon className="h-5 w-5" />
            ) : (
              <PauseIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(${translateX}%)` }}
      >
        {activeOffers.map((offer) => {
          const canBuy = user?.role === 'buyer' && offer.status === 'activa' && offer.seller._id !== user._id;
          
          return (
            <div
              key={offer._id}
              className="flex-none w-full sm:w-1/2 lg:w-1/3 p-3"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden h-full">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {offer.type ? offer.type.charAt(0).toUpperCase() + offer.type.slice(1) : 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-500">{offer.location || 'N/A'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800`}>
                      Activa
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Cantidad:</span>
                      <span className="font-medium text-gray-900">{offer.energyAmount} kWh</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Precio:</span>
                      <span className="font-medium text-gray-900">${offer.pricePerUnit}/kWh</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Vendedor:</span>
                      <span className="font-medium text-gray-900">{offer.seller.name}</span>
                    </div>
                  </div>

                  {canBuy && (
                    <div className="mt-4">
                      <button
                        onClick={(e) => onOpenModal(offer, e)}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        Comprar Energía
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default OffersCarousel; 