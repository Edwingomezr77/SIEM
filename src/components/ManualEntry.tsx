import React, { useState } from 'react';
import { Plus, Package } from 'lucide-react';

interface ManualEntryProps {
  onConfirmationRequest: (data: { marca: string; cantidad: number }) => void;
}

export const ManualEntry: React.FC<ManualEntryProps> = ({ onConfirmationRequest }) => {
  const [marca, setMarca] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!marca.trim()) return;

    // En lugar de agregar directamente, solicitar confirmación
    onConfirmationRequest({ marca: marca.trim(), cantidad: 1 });
    setMarca('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Package className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Registro Individual</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="marca" className="block text-sm font-medium text-gray-700 mb-2">
            Marca de la Pieza
          </label>
          <input
            type="text"
            id="marca"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            placeholder="Ej: VIG-200X100, COL-300X300..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-1">
            <strong>Cantidad:</strong>
          </p>
          <p className="text-lg font-semibold text-gray-900">1 pieza</p>
          <p className="text-xs text-gray-500 mt-1">
            Registro individual de una pieza. Para múltiples piezas usa "Registrar Lote"
          </p>
        </div>

        <button
          type="submit"
          disabled={!marca.trim()}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            !marca.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
          }`}
        >
          <Plus className="w-5 h-5" />
          Agregar Pieza
        </button>
      </form>
    </div>
  );
};