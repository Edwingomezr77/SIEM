import React, { useState, useEffect } from 'react';
import { X, Save, Package } from 'lucide-react';

interface ManualConfirmationModalProps {
  data: { marca: string; cantidad: number };
  onConfirm: (data: { marca: string; cantidad: number; folio?: string }) => void;
  onCancel: () => void;
}

export const ManualConfirmationModal: React.FC<ManualConfirmationModalProps> = ({
  data,
  onConfirm,
  onCancel
}) => {
  const [folio, setFolio] = useState('');

  useEffect(() => {
    setFolio('');
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.marca.trim()) return;
    
    onConfirm({
      marca: data.marca,
      cantidad: 1,
      folio: folio.trim() || undefined
    });
  };

  if (!data || !data.marca) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Confirmar Registro</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Pieza a registrar:</strong>
            </p>
            <p className="text-lg font-semibold text-blue-900">{data.marca}</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-1">
              <strong>Cantidad:</strong>
            </p>
            <p className="text-lg font-semibold text-gray-900">1 pieza</p>
          </div>

          <div>
            <label htmlFor="manual-folio" className="block text-sm font-medium text-gray-700 mb-2">
              Folio de la Pieza (Opcional)
            </label>
            <input
              type="text"
              id="manual-folio"
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
              placeholder="Ingresa el folio único..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Registrar Pieza
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};