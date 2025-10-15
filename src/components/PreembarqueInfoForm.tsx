import React, { useState, useEffect } from 'react';
import { Save, Truck, User, Phone, Hash, Building, Package } from 'lucide-react';
import { PreembarqueInfo } from '../types/database';
import { RemisionService } from '../services/remisionService';

interface PreembarqueInfoFormProps {
  remisionId: string;
  currentEstado: 'pendiente' | 'embarcada' | 'entregada';
  onEstadoChange: (estado: 'pendiente' | 'embarcada' | 'entregada') => void;
  onInfoUpdated: () => void;
}

export const PreembarqueInfoForm: React.FC<PreembarqueInfoFormProps> = ({
  remisionId,
  currentEstado,
  onEstadoChange,
  onInfoUpdated
}) => {
  const [info, setInfo] = useState<Partial<PreembarqueInfo>>({
    supervisor_obra: '',
    operador: '',
    telefono: '',
    placas_camion: '',
    transportista: '',
    barrotes: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    loadPreembarqueInfo();
  }, [remisionId]);

  const loadPreembarqueInfo = async () => {
    try {
      setLoading(true);
      const data = await RemisionService.getPreembarqueInfo(remisionId);
      if (data) {
        setInfo({
          supervisor_obra: data.supervisor_obra || '',
          operador: data.operador || '',
          telefono: data.telefono || '',
          placas_camion: data.placas_camion || '',
          transportista: data.transportista || '',
          barrotes: data.barrotes || ''
        });
      }
    } catch (error) {
      console.error('Error loading preembarque info:', error);
      showNotification('Error al cargar la información', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = (field: keyof PreembarqueInfo, value: string) => {
    setInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await RemisionService.upsertPreembarqueInfo(remisionId, info);
      onInfoUpdated();
      showNotification('Información guardada exitosamente', 'success');
    } catch (error) {
      console.error('Error saving preembarque info:', error);
      showNotification('Error al guardar la información', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEstadoChange = async (newEstado: 'pendiente' | 'embarcada' | 'entregada') => {
    try {
      await RemisionService.updateRemisionEstado(remisionId, newEstado);
      onEstadoChange(newEstado);
      showNotification(`Estado actualizado a: ${newEstado}`, 'success');
    } catch (error) {
      console.error('Error updating estado:', error);
      showNotification('Error al actualizar el estado', 'error');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'embarcada': return 'bg-blue-500 hover:bg-blue-600';
      case 'entregada': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Información del Pre-Embarque
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Estado:</span>
          <div className="flex gap-2">
            {(['pendiente', 'embarcada', 'entregada'] as const).map((estado) => (
              <button
                key={estado}
                onClick={() => handleEstadoChange(estado)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  currentEstado === estado
                    ? getEstadoColor(estado) + ' text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supervisor de Obra */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Supervisor de Obra
          </label>
          <input
            type="text"
            value={info.supervisor_obra || ''}
            onChange={(e) => handleInputChange('supervisor_obra', e.target.value)}
            placeholder="Nombre del supervisor..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Operador */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Operador
          </label>
          <input
            type="text"
            value={info.operador || ''}
            onChange={(e) => handleInputChange('operador', e.target.value)}
            placeholder="Nombre del operador..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Teléfono
          </label>
          <input
            type="tel"
            value={info.telefono || ''}
            onChange={(e) => handleInputChange('telefono', e.target.value)}
            placeholder="Número de teléfono..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Placas del Camión */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Hash className="w-4 h-4 inline mr-2" />
            Placas o Matrícula del Camión
          </label>
          <input
            type="text"
            value={info.placas_camion || ''}
            onChange={(e) => handleInputChange('placas_camion', e.target.value)}
            placeholder="Placas del vehículo..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Transportista */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Truck className="w-4 h-4 inline mr-2" />
            Transportista
          </label>
          <input
            type="text"
            value={info.transportista || ''}
            onChange={(e) => handleInputChange('transportista', e.target.value)}
            placeholder="Empresa transportista..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Barrotes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Package className="w-4 h-4 inline mr-2" />
            Barrotes
          </label>
          <input
            type="text"
            value={info.barrotes || ''}
            onChange={(e) => handleInputChange('barrotes', e.target.value)}
            placeholder="Información de barrotes..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Botón de Guardar */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Guardando...' : 'Guardar Información'}
        </button>
      </div>
    </div>
  );
};