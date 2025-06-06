import { useState, useEffect } from 'react';
import { transactionsAPI } from '../services/api';
import type { Transaction } from '../types';
import Layout from '../components/Layout';
import { formatCurrency } from '../utils/format';
import { useAuthStore } from '../store/authStore';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface TransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

type SortField = 'createdAt' | 'type' | 'energyAmount' | 'totalPrice' | 'status';
type SortDirection = 'asc' | 'desc';

function TransactionModal({ transaction, isOpen, onClose }: TransactionModalProps) {
  if (!transaction || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay de fondo con efecto blur */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm" onClick={onClose} />

        {/* Modal con efecto de vidrio */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/80 backdrop-blur-md shadow-xl rounded-2xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Detalles de la Transacción
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Información General</h4>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">ID:</span> {transaction._id}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Fecha:</span> {new Date(transaction.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Estado:</span> {transaction.status}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Tipo de Energía:</span> {transaction.type}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Detalles de la Transacción</h4>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Cantidad:</span> {transaction.energyAmount} kWh
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Precio Total:</span> {formatCurrency(transaction.totalPrice)}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Precio por kWh:</span> {formatCurrency(transaction.pricePerUnit)}
                </p>
              </div>
            </div>

            <div className="col-span-2">
              <h4 className="text-sm font-medium text-gray-500">Participantes</h4>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">Vendedor</p>
                  <p className="text-sm text-gray-600">{transaction.seller.name}</p>
                  <p className="text-sm text-gray-600">{transaction.seller.email}</p>
                </div>
                <div className="p-4 bg-white/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">Comprador</p>
                  <p className="text-sm text-gray-600">{transaction.buyer.name}</p>
                  <p className="text-sm text-gray-600">{transaction.buyer.email}</p>
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

  const getSortedTransactions = () => {
    return [...transactions].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
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
        default:
          return 0;
      }
    });
  };

  const renderSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return (
        <div className="ml-2 inline-block opacity-0 group-hover:opacity-50">
          <ChevronUpIcon className="h-4 w-4" />
        </div>
      );
    }
    return (
      <div className="ml-2 inline-block">
        {sortDirection === 'asc' ? (
          <ChevronUpIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        )}
      </div>
    );
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
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Historial de Transacciones
          </h1>
          <p className="mt-2 text-sm text-gray-700 sm:mt-0">
            Total de transacciones: {transactions.length}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('createdAt')}
                  >
                    Fecha {renderSortIcon('createdAt')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('type')}
                  >
                    Tipo {renderSortIcon('type')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('energyAmount')}
                  >
                    Cantidad {renderSortIcon('energyAmount')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('totalPrice')}
                  >
                    Precio Total {renderSortIcon('totalPrice')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('status')}
                  >
                    Estado {renderSortIcon('status')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {user?.role === 'buyer' ? 'Vendedor' : 'Comprador'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-200">
                {getSortedTransactions().map((transaction) => {
                  const counterparty = user?.role === 'buyer' ? transaction.seller : transaction.buyer;
                  return (
                    <tr
                      key={transaction._id}
                      onClick={() => setSelectedTransaction(transaction)}
                      className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{transaction._id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.energyAmount} kWh
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(transaction.totalPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.status === 'completada'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pendiente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {counterparty?.name || 'Usuario no disponible'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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