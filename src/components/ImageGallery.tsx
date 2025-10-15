import React, { useState } from 'react';
import { Trash2, Edit3, X, Save, Image as ImageIcon, ZoomIn } from 'lucide-react';
import { RemisionImage } from '../types/database';

interface ImageGalleryProps {
  images: RemisionImage[];
  onDelete: (imageId: string) => void;
  onUpdateDescription: (imageId: string, description: string) => void;
  loading?: boolean;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onDelete,
  onUpdateDescription,
  loading = false
}) => {
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<RemisionImage | null>(null);

  const handleEditStart = (image: RemisionImage) => {
    setEditingImage(image.id);
    setEditDescription(image.description);
  };

  const handleEditSave = async (imageId: string) => {
    try {
      await onUpdateDescription(imageId, editDescription);
      setEditingImage(null);
      setEditDescription('');
    } catch (error) {
      console.error('Error updating description:', error);
    }
  };

  const handleEditCancel = () => {
    setEditingImage(null);
    setEditDescription('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (images.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay imágenes</h3>
        <p className="text-gray-600">Sube imágenes para documentar este pre-embarque</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <ImageIcon className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Imágenes ({images.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={image.image_url}
                  alt={image.description || image.image_name}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedImage(image)}
                />
                
                {/* Overlay con acciones */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedImage(image)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      title="Ver imagen completa"
                    >
                      <ZoomIn className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleEditStart(image)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      title="Editar descripción"
                    >
                      <Edit3 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => onDelete(image.id)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      title="Eliminar imagen"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Información de la imagen */}
              <div className="mt-2">
                {editingImage === image.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Descripción de la imagen..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSave(image.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                      >
                        <Save className="w-3 h-3" />
                        Guardar
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="flex-1 px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {image.description || image.image_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(image.created_at)}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para ver imagen completa */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            <img
              src={selectedImage.image_url}
              alt={selectedImage.description || selectedImage.image_name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            {selectedImage.description && (
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
                <p className="text-sm">{selectedImage.description}</p>
                <p className="text-xs text-gray-300 mt-1">
                  {formatDate(selectedImage.created_at)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};