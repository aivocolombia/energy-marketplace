import { useState, useEffect } from 'react';
import { transactionsAPI } from '../services/api';
import type { Transaction } from '../types';
import Layout from '../components/Layout';
import { formatCurrency } from '../utils/format';
import { useAuthStore } from '../store/authStore';
import { ChevronUpIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

type SortField = 'createdAt' | 'type' | 'energyAmount' | 'totalPrice' | 'status' | 'counterparty';
type SortDirection = 'asc' | 'desc';

function TransactionModal({ transaction, isOpen, onClose }: TransactionModalProps) {
  if (!transaction || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/30 backdrop-blur-md shadow-xl rounded-2xl border border-white/20">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Detalles de la Transacción
            </h3>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Información General</h4>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-800">
                  <span className="font-medium">ID:</span> {transaction._id}
                </p>
                <p className="text-sm text-gray-800">
                  <span className="font-medium">Fecha:</span> {format(new Date(transaction.createdAt), 'PPp', { locale: es })}
                </p>
                <p className="text-sm text-gray-800">
                  <span className="font-medium">Estado:</span> {transaction.status}
                </p>
                <p className="text-sm text-gray-800">
                  <span className="font-medium">Tipo de Energía:</span> {transaction.type}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700">Detalles de la Transacción</h4>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-800">
                  <span className="font-medium">Cantidad:</span> {transaction.energyAmount} kWh
                </p>
                <p className="text-sm text-gray-800">
                  <span className="font-medium">Precio Total:</span> {formatCurrency(transaction.totalPrice)}
                </p>
                <p className="text-sm text-gray-800">
                  <span className="font-medium">Precio por kWh:</span> {formatCurrency(transaction.pricePerUnit)}
                </p>
              </div>
            </div>

            <div className="col-span-2">
              <h4 className="text-sm font-medium text-gray-700">Participantes</h4>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20">
                  <p className="text-sm font-medium text-gray-800">Vendedor</p>
                  <p className="text-sm text-gray-700">{transaction.seller.name}</p>
                  <p className="text-sm text-gray-700">{transaction.seller.email}</p>
                </div>
                <div className="p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20">
                  <p className="text-sm font-medium text-gray-800">Comprador</p>
                  <p className="text-sm text-gray-700">{transaction.buyer.name}</p>
                  <p className="text-sm text-gray-700">{transaction.buyer.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionsAPI.getTransactions();
      setTransactions(data);
      setError(null);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
      setError('Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const filteredAndSortedTransactions = () => {
    let result = [...transactions];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transaction) => {
        const counterparty = user?.role === 'buyer' ? transaction.seller : transaction.buyer;
        const searchableValues = [
          transaction._id,
          format(new Date(transaction.createdAt), 'PPp', { locale: es }),
          transaction.type,
          transaction.energyAmount.toString(),
          formatCurrency(transaction.totalPrice),
          transaction.status,
          counterparty?.name || '',
          counterparty?.email || ''
        ];
        return searchableValues.some(value => 
          value.toLowerCase().includes(searchLower)
        );
      });
    }

    result.sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      const counterpartyA = user?.role === 'buyer' ? a.seller : a.buyer;
      const counterpartyB = user?.role === 'buyer' ? b.seller : b.buyer;
      
      switch (sortField) {
        case 'createdAt':
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
        case 'type':
          return a.type.localeCompare(b.type) * direction;
        case 'energyAmount':
          return (a.energyAmount - b.energyAmount) * direction;
        case 'totalPrice':
          return (a.totalPrice - b.totalPrice) * direction;
        case 'status':
          return a.status.localeCompare(b.status) * direction;
        case 'counterparty':
          return ((counterpartyA?.name || '').localeCompare(counterpartyB?.name || '')) * direction;
        default:
          return 0;
      }
    });

    return result;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-600">
            Cargando transacciones...
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Historial de Transacciones
          </h1>
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        ID
                      </th>
                      {renderSortableHeader('createdAt', 'Fecha')}
                      {renderSortableHeader('type', 'Tipo')}
                      {renderSortableHeader('energyAmount', 'Cantidad')}
                      {renderSortableHeader('totalPrice', 'Precio Total')}
                      {renderSortableHeader('status', 'Estado')}
                      {renderSortableHeader('counterparty', user?.role === 'buyer' ? 'Vendedor' : 'Comprador')}
                    </tr>
                  </thead>
                </table>

                {/* Contenedor con scroll para el cuerpo de la tabla */}
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="min-w-full divide-y divide-white/20">
                    <tbody className="divide-y divide-white/10 bg-white/5">
                      {filteredAndSortedTransactions().map((transaction) => {
                        const counterparty = user?.role === 'buyer' ? transaction.seller : transaction.buyer;
                        return (
                          <tr
                            key={transaction._id}
                            onClick={() => setSelectedTransaction(transaction)}
                            className="hover:bg-white/10 cursor-pointer transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              #{transaction._id.slice(0, 8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {format(new Date(transaction.createdAt), 'PPp', { locale: es })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {transaction.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {transaction.energyAmount} kWh
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {formatCurrency(transaction.totalPrice)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {counterparty?.name || 'Usuario no disponible'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredAndSortedTransactions().length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No se encontraron resultados para tu búsqueda</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <TransactionModal
          transaction={selectedTransaction}
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      </div>
    </Layout>
  );
} 