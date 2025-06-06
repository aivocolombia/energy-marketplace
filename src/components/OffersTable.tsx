import React, { useState, useMemo } from 'react';
import { EnergyOffer } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';

interface OffersTableProps {
  offers: EnergyOffer[];
  onOpenModal: (offer: EnergyOffer, event: React.MouseEvent) => void;
}

type SortField = 'type' | 'seller' | 'energyAmount' | 'pricePerUnit' | 'location' | 'availableFrom' | 'availableTo' | 'status';
type SortDirection = 'asc' | 'desc';

const OffersTable: React.FC<OffersTableProps> = ({ offers, onOpenModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('availableFrom');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { user } = useAuthStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activa':
        return 'bg-green-100 text-green-800';
      case 'vendida':
        return 'bg-blue-100 text-blue-800';
      case 'expirada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (availableTo: string) => {
    return new Date(availableTo) < new Date();
  };

  const canBuyOffer = (offer: EnergyOffer) => {
    if (!user || user.role !== 'buyer') return false;
    if (offer.seller._id === user._id) return false;
    if (offer.status !== 'activa') return false;
    if (isExpired(offer.availableTo)) return false;
    return true;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <div className="opacity-0 group-hover:opacity-100 ml-2 inline-block">
          <ChevronUpIcon className="h-4 w-4 text-gray-400" />
        </div>
      );
    }
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4 text-green-500 ml-2 inline-block" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 text-green-500 ml-2 inline-block" />
    );
  };

  const sortedAndFilteredOffers = useMemo(() => {
    let result = [...offers];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((offer) => {
        const now = new Date();
        const availableTo = new Date(offer.availableTo);
        const currentStatus = now > availableTo ? 'expirada' : offer.status;
        
        const searchableValues = [
          offer.type,
          offer.seller.name,
          offer.energyAmount.toString(),
          offer.pricePerUnit.toString(),
          offer.location,
          format(new Date(offer.availableFrom), 'PPp', { locale: es }),
          format(new Date(offer.availableTo), 'PPp', { locale: es }),
          currentStatus
        ];
        return searchableValues.some(value => 
          value.toLowerCase().includes(searchLower)
        );
      });
    }

    result.sort((a, b) => {
      let compareA: any;
      let compareB: any;

      switch (sortField) {
        case 'type':
          compareA = a.type;
          compareB = b.type;
          break;
        case 'seller':
          compareA = a.seller.name;
          compareB = b.seller.name;
          break;
        case 'energyAmount':
          compareA = a.energyAmount;
          compareB = b.energyAmount;
          break;
        case 'pricePerUnit':
          compareA = a.pricePerUnit;
          compareB = b.pricePerUnit;
          break;
        case 'location':
          compareA = a.location;
          compareB = b.location;
          break;
        case 'availableFrom':
          compareA = new Date(a.availableFrom).getTime();
          compareB = new Date(b.availableFrom).getTime();
          break;
        case 'availableTo':
          compareA = new Date(a.availableTo).getTime();
          compareB = new Date(b.availableTo).getTime();
          break;
        case 'status':
          compareA = isExpired(a.availableTo) ? 'expirada' : a.status;
          compareB = isExpired(b.availableTo) ? 'expirada' : b.status;
          break;
        default:
          return 0;
      }

      if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [offers, searchTerm, sortField, sortDirection]);

  const renderSortableHeader = (field: SortField, label: string) => (
    <th 
      scope="col" 
      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer group"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {label}
        {getSortIcon(field)}
      </div>
    </th>
  );

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Historial de Ofertas</h2>
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar en todas las columnas..."
            className="block w-full pl-10 pr-3 py-2 border border-white/20 rounded-md leading-5 bg-white/5 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
          />
        </div>
      </div>

      <div className="border border-white/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="relative">
              {/* Tabla con encabezado fijo */}
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5 backdrop-blur-sm">
                  <tr>
                    {renderSortableHeader('type', 'Tipo')}
                    {renderSortableHeader('seller', 'Vendedor')}
                    {renderSortableHeader('energyAmount', 'Cantidad')}
                    {renderSortableHeader('pricePerUnit', 'Precio/kWh')}
                    {renderSortableHeader('location', 'Ubicación')}
                    {renderSortableHeader('availableFrom', 'Disponible Desde')}
                    {renderSortableHeader('availableTo', 'Disponible Hasta')}
                    {renderSortableHeader('status', 'Estado')}
                  </tr>
                </thead>
              </table>

              {/* Contenedor con scroll para el cuerpo de la tabla */}
              <div className="max-h-[500px] overflow-y-auto">
                <table className="min-w-full divide-y divide-white/20">
                  <tbody className="divide-y divide-white/10 bg-white/5">
                    {sortedAndFilteredOffers.map((offer) => {
                      const expired = isExpired(offer.availableTo);
                      const status = expired ? 'expirada' : offer.status;
                      const isAvailableToBuy = canBuyOffer(offer);

                      return (
                        <tr 
                          key={offer._id} 
                          onClick={(e) => isAvailableToBuy && onOpenModal(offer, e)}
                          className={`
                            transition-colors
                            ${isAvailableToBuy ? 'hover:bg-white/10 cursor-pointer' : 'hover:bg-white/5'}
                          `}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {offer.type ? offer.type.charAt(0).toUpperCase() + offer.type.slice(1) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {offer.seller?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {offer.energyAmount ? `${offer.energyAmount} kWh` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            ${offer.pricePerUnit || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {offer.location || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {offer.availableFrom ? format(new Date(offer.availableFrom), 'PPp', { locale: es }) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {offer.availableTo ? format(new Date(offer.availableTo), 'PPp', { locale: es }) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                              {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {sortedAndFilteredOffers.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No se encontraron resultados para tu búsqueda</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersTable; 