import React, { useState, useEffect } from 'react';
import { X, Save, QrCode } from 'lucide-react';

interface QRConfirmationModalProps {
  data: { marca: string; cantidad: number } | null;
  onConfirm: (data: { marca: string; cantidad: number; folio?: string }) => void;
  onCancel: () => void;
}

export const QRConfirmationModal: React.FC<QRConfirmationModalProps> = ({
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
    if (!data?.marca.trim()) return;
    
    onConfirm({
      marca: data.marca,
      cantidad: 1,
      folio: folio.trim() || undefined
    });
  };

  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <QrCode className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">QR Escaneado</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 mb-2">
              <strong>Pieza detectada:</strong>
            </p>
            <p className="text-lg font-semibold text-green-900">{data.marca}</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-1">
              <strong>Cantidad:</strong>
            </p>
            <p className="text-lg font-semibold text-gray-900">1 pieza</p>
          </div>

          <div>
            <label htmlFor="qr-folio" className="block text-sm font-medium text-gray-700 mb-2">
              Folio de la Pieza (Opcional)
            </label>
            <input
              type="text"
              id="qr-folio"
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
              placeholder="Ingresa el folio único..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
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