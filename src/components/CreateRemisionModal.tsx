import React, { useState } from 'react';
import { X, Save, Package } from 'lucide-react';

interface CreateRemisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (numeroRemision: string, proyecto: string) => void;
}

export const CreateRemisionModal: React.FC<CreateRemisionModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [numeroRemision, setNumeroRemision] = useState('');
  const [proyecto, setProyecto] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroRemision.trim() || !proyecto.trim()) return;

    setLoading(true);
    try {
      await onCreate(numeroRemision.trim(), proyecto.trim());
      setNumeroRemision('');
      setProyecto('');
      onClose();
    } catch (error) {
      console.error('Error creating remision:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Nuevo Pre-Embarque</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="numero-remision" className="block text-sm font-medium text-gray-700 mb-2">
              Número de Remisión *
            </label>
            <input
              type="text"
              id="numero-remision"
              value={numeroRemision}
              onChange={(e) => setNumeroRemision(e.target.value)}
              placeholder="Ej: REM-2024-001"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="proyecto" className="block text-sm font-medium text-gray-700 mb-2">
              Proyecto *
            </label>
            <input
              type="text"
              id="proyecto"
              value={proyecto}
              onChange={(e) => setProyecto(e.target.value)}
              placeholder="Ej: Torre Corporativa, Edificio Central..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !numeroRemision.trim() || !proyecto.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Crear Pre-Embarque
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};