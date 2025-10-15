import React, { useState, useEffect } from 'react';
import { Search, Plus, Package, Calendar, Hash } from 'lucide-react';
import { Remision, PreembarqueInfo } from '../types/database';
import { RemisionService } from '../services/remisionService';

interface RemisionListProps {
  onSelectRemision: (remision: Remision) => void;
  onCreateRemision: () => void;
}

export function RemisionList({ onSelectRemision, onCreateRemision }: RemisionListProps) {
  const [remisiones, setRemisiones] = useState<Remision[]>([]);
  const [preembarqueInfos, setPreembarqueInfos] = useState<Record<string, PreembarqueInfo>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRemisiones();
  }, []);

  const loadRemisiones = async () => {
    try {
      setLoading(true);
      const data = await RemisionService.getAllRemisiones();
      setRemisiones(data);
      
      // Cargar información de pre-embarque para cada remisión
      const infos: Record<string, PreembarqueInfo> = {};
      for (const remision of data) {
        try {
          const info = await RemisionService.getPreembarqueInfo(remision.id);
          if (info) {
            infos[remision.id] = info;
          }
        } catch (error) {
          console.error(`Error loading preembarque info for ${remision.id}:`, error);
        }
      }
      setPreembarqueInfos(infos);
    } catch (error) {
      console.error('Error loading remisiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRemisiones = remisiones.filter(remision =>
    remision.numero_remision.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (remision.cliente && remision.cliente.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'embarcada':
        return 'bg-blue-100 text-blue-800';
      case 'entregada':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando remisiones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Remisiones de Pre-Embarque
          </h1>
          <p className="text-gray-600">
            Gestiona tus remisiones y registra las piezas embarcadas
          </p>
        </div>

        {/* Search and Create */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por número de remisión o proyecto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={onCreateRemision}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Crear Nuevo Pre-Embarque
          </button>
        </div>

        {/* Remisiones Grid */}
        {filteredRemisiones.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron remisiones' : 'No hay remisiones'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza creando tu primera remisión de pre-embarque'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={onCreateRemision}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Crear Primera Remisión
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRemisiones.map((remision) => (
              <div
                key={remision.id}
                onClick={() => onSelectRemision(remision)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">
                      {remision.numero_remision}
                    </h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(remision.estado || 'pendiente')}`}>
                    {remision.estado || 'pendiente'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="w-4 h-4" />
                    <span>Proyecto: {remision.cliente || 'Sin especificar'}</span>
                  </div>
                  {preembarqueInfos[remision.id]?.supervisor_obra && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Hash className="w-4 h-4" />
                      <span>Supervisor: {preembarqueInfos[remision.id].supervisor_obra}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Creado: {formatDate(remision.fecha_creacion!)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-gray-900">
                    {remision.total_piezas || 0} piezas
                  </span>
                  <span className="text-sm text-blue-600 font-medium">
                    Ver detalles →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}