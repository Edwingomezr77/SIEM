import React, { useState } from 'react';
import { Trash2, CreditCard as Edit3, Package, ArrowUpDown } from 'lucide-react';

export interface ShipmentItem {
  id: string;
  marca: string;
  cantidad: number;
  folio?: string | null;
  timestamp: Date;
}

interface ShipmentTableProps {
  items: ShipmentItem[];
  onDelete: (id: string) => void;
  onEdit: (item: ShipmentItem) => void;
}

export const ShipmentTable: React.FC<ShipmentTableProps> = ({ items, onDelete, onEdit }) => {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const totalPiezas = items.reduce((sum, item) => sum + item.cantidad, 0);

  const sortedItems = [...items].sort((a, b) => {
    if (sortOrder === 'newest') {
      return b.timestamp.getTime() - a.timestamp.getTime();
    } else {
      return a.timestamp.getTime() - b.timestamp.getTime();
    }
  });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay piezas registradas</h3>
        <p className="text-gray-600">Escanea un código QR o agrega piezas manualmente para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-blue-800">Resumen del Embarque</h3>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-800">{totalPiezas}</p>
            <p className="text-sm text-blue-600">Total de piezas</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marca
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Folio
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={toggleSortOrder}
                    className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                  >
                    <span>Hora de Registro</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-normal text-gray-400 block mt-1">
                    {sortOrder === 'newest' ? 'Más reciente primero' : 'Más antigua primero'}
                  </span>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.marca}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.folio ? (
                      <div className="text-sm text-gray-900">
                        {item.folio.includes('-') ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Lote: {item.folio}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.folio}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Sin folio</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      item.cantidad > 1 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.cantidad} pzs
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.timestamp.toLocaleTimeString('es-MX', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};