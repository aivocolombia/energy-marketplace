import { useState, useEffect } from 'react';
import { transactionsAPI } from '../services/api';
import type { Transaction } from '../types';
import Layout from '../components/Layout';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await transactionsAPI.getTransactions();
      setTransactions(data);
    } catch (err) {
      setError('Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Cargando transacciones...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Historial de Transacciones
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <li key={transaction.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-green-600 truncate">
                        Transacción #{transaction.id}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500">
                        Cantidad: {transaction.quantity} kWh
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                      <p className="text-sm text-gray-900">
                        ${transaction.totalPrice.toFixed(2)}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Vendedor ID: {transaction.sellerId}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Comprador ID: {transaction.buyerId}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
} 