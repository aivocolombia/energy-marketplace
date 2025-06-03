import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { offersAPI } from '../services/api';
import type { EnergyOffer } from '../types';
import Layout from '../components/Layout';

export default function Dashboard() {
  const [offers, setOffers] = useState<EnergyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadOffers();
  }, []);

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

  const handleBuyOffer = async (offerId: string) => {
    // Implementar lógica de compra
    alert('Funcionalidad de compra en desarrollo');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Cargando ofertas...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Ofertas de Energía Disponibles
          </h1>
          {user?.role === 'seller' && (
            <button
              onClick={() => alert('Funcionalidad en desarrollo')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {offer.quantity} kWh
                      </h3>
                      <p className="text-sm text-gray-500">
                        Precio: ${offer.pricePerKwh}/kWh
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">
                        Inicio: {new Date(offer.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Fin: {new Date(offer.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      offer.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {offer.status === 'active' ? 'Activa' : 'No disponible'}
                  </span>
                </div>
              </div>
              {user?.role === 'buyer' && offer.status === 'active' && (
                <div className="px-4 py-4 sm:px-6">
                  <button
                    onClick={() => handleBuyOffer(offer.id)}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Comprar Energía
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
} 