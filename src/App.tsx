import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Header } from './components/Header';
import { RemisionList } from './components/RemisionList';
import RemisionDetail from './components/RemisionDetail';
import { CreateRemisionModal } from './components/CreateRemisionModal';
import { RemisionService } from './services/remisionService';
import { Remision } from './types/database';
import { AlertCircle } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedRemision, setSelectedRemision] = useState<Remision | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSelectRemision = (remision: Remision) => {
    setSelectedRemision(remision);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedRemision(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreateRemision = async (numeroRemision: string, proyecto: string) => {
    try {
      // Verificar si ya existe una remisión con ese número
      const existing = await RemisionService.findRemisionByNumero(numeroRemision);
      if (existing) {
        showNotification('Ya existe una remisión con ese número', 'error');
        return;
      }

      const newRemision = await RemisionService.createRemision(numeroRemision, proyecto);
      showNotification(`Remisión ${numeroRemision} creada exitosamente`, 'success');
      setShowCreateModal(false);
      setRefreshTrigger(prev => prev + 1);
      
      // Abrir la nueva remisión automáticamente
      handleSelectRemision(newRemision);
    } catch (error) {
      console.error('Error creating remision:', error);
      showNotification('Error al crear la remisión', 'error');
    }
  };

  const handleRemisionUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
    // Actualizar la remisión seleccionada si está en vista de detalle
    if (selectedRemision) {
      RemisionService.findRemisionByNumero(selectedRemision.numero_remision)
        .then(updated => {
          if (updated) {
            setSelectedRemision(updated);
          }
        });
    }
  };

  const handleLogin = (user: any) => {
    // El contexto maneja el estado del usuario
  };

  const handleLoginError = (message: string) => {
    showNotification(message, 'error');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} onError={handleLoginError} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <AlertCircle className="w-5 h-5" />
          {notification.message}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'list' ? (
          <RemisionList
            key={refreshTrigger}
            onSelectRemision={handleSelectRemision}
            onCreateRemision={() => setShowCreateModal(true)}
          />
        ) : selectedRemision ? (
          <RemisionDetail
            remision={selectedRemision}
            onBack={handleBackToList}
            onRemisionUpdated={handleRemisionUpdated}
          />
        ) : null}
      </main>

      {/* Create Remision Modal */}
      <CreateRemisionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateRemision}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;