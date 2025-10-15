import React from 'react';
import { Factory, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Factory className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Pre-Embarques
              </h1>
              <p className="text-sm text-gray-600">
                Gestión de Remisiones y Piezas de Acero
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Información del usuario */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-700">
                  {user?.email}
                </span>
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Usuario
              </span>
            </div>

            {/* Botón de cerrar sesión */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};