import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export interface ShipmentItem {
  id: string;
  marca: string;
  cantidad: number;
  folio?: string | null;
  timestamp_registro?: string;
}

interface EditModalProps {
  item: ShipmentItem;
  onSave: (item: ShipmentItem) => void;
  onClose: () => void;
}

export const EditModal: React.FC<EditModalProps> = ({ item, onSave, onClose }) => {
  const [marca, setMarca] = useState(item.marca);
  const [folio, setFolio] = useState(item.folio || '');

  useEffect(() => {
    setMarca(item.marca);
    setFolio(item.folio || '');
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      ...item, 
      marca, 
      cantidad: 1, // Cantidad fija de 1
      folio: folio || null 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Editar Pieza</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="edit-marca" className="block text-sm font-medium text-gray-700 mb-2">
              Marca
            </label>
            <input
              type="text"
              id="edit-marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad
            </label>
            <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
              1 pieza (no modificable)
            </div>
          </div>

          <div>
            <label htmlFor="edit-folio" className="block text-sm font-medium text-gray-700 mb-2">
              Folio (Opcional)
            </label>
            <input
              type="text"
              id="edit-folio"
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ingresa el folio si lo tienes"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};