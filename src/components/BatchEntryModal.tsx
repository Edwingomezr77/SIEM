import React, { useState, useEffect } from 'react';
import { X, Save, Package, Hash, QrCode } from 'lucide-react';

interface BatchEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { marca: string; folioInicio: number; folioFin: number; cantidad: number }) => void;
  qrData?: { marca: string; cantidad: number } | null;
}

export const BatchEntryModal: React.FC<BatchEntryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  qrData
}) => {
  const [marca, setMarca] = useState('');
  const [folioInicio, setFolioInicio] = useState('');
  const [folioFin, setFolioFin] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar datos del QR cuando se abre el modal
  useEffect(() => {
    if (isOpen && qrData) {
      setMarca(qrData.marca);
    } else if (isOpen && !qrData) {
      setMarca('');
      setFolioInicio('');
      setFolioFin('');
    }
  }, [isOpen, qrData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!marca.trim() || !folioInicio || !folioFin) return;

    const inicio = parseInt(folioInicio);
    const fin = parseInt(folioFin);

    if (inicio > fin) {
      alert('El folio inicial no puede ser mayor al folio final');
      return;
    }

    if (inicio < 1 || fin < 1) {
      alert('Los folios deben ser números positivos');
      return;
    }

    const cantidad = fin - inicio + 1;

    if (cantidad > 1000) {
      if (!confirm(`¿Está seguro de registrar ${cantidad} piezas? Esto puede tomar un momento.`)) {
        return;
      }
    }

    setLoading(true);
    onConfirm({
      marca: marca.trim(),
      folioInicio: inicio,
      folioFin: fin,
      cantidad
    });
  };

  const handleClose = () => {
    if (!loading) {
      setMarca('');
      setFolioInicio('');
      setFolioFin('');
      onClose();
    }
  };

  const getCantidadPiezas = () => {
    const inicio = parseInt(folioInicio);
    const fin = parseInt(folioFin);
    if (inicio && fin && inicio <= fin) {
      return fin - inicio + 1;
    }
    return 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-800">Registro por Lote</h3>
            {qrData && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                QR Detectado
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {qrData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Datos del QR</span>
              </div>
              <p className="text-sm text-green-700">
                <strong>Marca detectada:</strong> {qrData.marca}
              </p>
              <p className="text-xs text-green-600 mt-1">
                La marca se ha cargado automáticamente desde el código QR
              </p>
            </div>
          )}

          <div>
            <label htmlFor="batch-marca" className="block text-sm font-medium text-gray-700 mb-2">
              Marca de las Piezas *
            </label>
            <input
              type="text"
              id="batch-marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Ej: VIG-200X100, COL-300X300..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              required
              disabled={loading}
              autoFocus={!qrData}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="folio-inicio" className="block text-sm font-medium text-gray-700 mb-2">
                Folio Inicial *
              </label>
              <input
                type="number"
                id="folio-inicio"
                value={folioInicio}
                onChange={(e) => setFolioInicio(e.target.value)}
                placeholder="1"
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="folio-fin" className="block text-sm font-medium text-gray-700 mb-2">
                Folio Final *
              </label>
              <input
                type="number"
                id="folio-fin"
                value={folioFin}
                onChange={(e) => setFolioFin(e.target.value)}
                placeholder="200"
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                required
                disabled={loading}
              />
            </div>
          </div>

          {getCantidadPiezas() > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-800">Resumen del Lote</span>
              </div>
              <div className="space-y-1 text-sm text-orange-700">
                <p><strong>Marca:</strong> {marca || 'Sin especificar'}</p>
                <p><strong>Rango de folios:</strong> {folioInicio} - {folioFin}</p>
                <p><strong>Total de piezas:</strong> {getCantidadPiezas()}</p>
                <p><strong>Se registrará como:</strong> 1 lote con {getCantidadPiezas()} piezas</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !marca.trim() || !folioInicio || !folioFin || getCantidadPiezas() === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Registrando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Registrar Lote ({getCantidadPiezas()})
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};