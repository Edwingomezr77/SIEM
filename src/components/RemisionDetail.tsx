import React, { useState, useEffect } from 'react';
import { Remision, ShipmentItem, RemisionImage } from '../types/database';
import { RemisionService } from '../services/remisionService';
import { ImageService } from '../services/imageService';
import { QRScanner } from './QRScanner';
import { ManualEntry } from './ManualEntry';
import { ShipmentTable } from './ShipmentTable';
import { EditModal } from './EditModal';
import { PreembarqueInfoForm } from './PreembarqueInfoForm';
import { QRConfirmationModal } from './QRConfirmationModal';
import { ManualConfirmationModal } from './ManualConfirmationModal';
import { BatchEntryModal } from './BatchEntryModal';
import { ImageUpload } from './ImageUpload';
import { ImageGallery } from './ImageGallery';
import { PDFService } from '../services/pdfService';
import { parseQRCode } from '../utils/qrParser';
import { ArrowLeft, QrCode, CreditCard as Edit3, Camera, Image, FileText, Download, Package } from 'lucide-react';

interface RemisionDetailProps {
  remision: Remision;
  onBack: () => void;
  onRemisionUpdated: () => void;
}

export default function RemisionDetail({ remision, onBack, onRemisionUpdated }: RemisionDetailProps) {
  const [items, setItems] = useState<ShipmentItem[]>([]);
  const [images, setImages] = useState<RemisionImage[]>([]);
  const [preembarqueInfo, setPreembarqueInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [isQRScannerActive, setIsQRScannerActive] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreembarqueForm, setShowPreembarqueForm] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showBatchEntry, setShowBatchEntry] = useState(false);
  const [editingItem, setEditingItem] = useState<ShipmentItem | null>(null);
  const [batchQRData, setBatchQRData] = useState<{ marca: string; cantidad: number } | null>(null);
  const [qrConfirmation, setQrConfirmation] = useState<{
    show: boolean;
    data: any;
  }>({ show: false, data: null });
  const [manualConfirmation, setManualConfirmation] = useState<{
    show: boolean;
    data: Partial<ShipmentItem>;
  }>({ show: false, data: {} });

  useEffect(() => {
    loadItems();
    loadImages();
    loadPreembarqueInfo();
  }, [remision.id]);

  const loadItems = async () => {
    try {
      const remisionData = await RemisionService.getRemisionWithPiezas(remision.id);
      if (remisionData) {
        const shipmentItems = remisionData.piezas_embarcadas.map(pieza => ({
          id: pieza.id,
          marca: pieza.marca,
          cantidad: pieza.cantidad,
          folio: pieza.folio,
          timestamp: new Date(pieza.timestamp_registro)
        }));
        setItems(shipmentItems);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async () => {
    try {
      const remisionImages = await ImageService.getRemisionImages(remision.id);
      setImages(remisionImages);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const loadPreembarqueInfo = async () => {
    try {
      const info = await RemisionService.getPreembarqueInfo(remision.id);
      setPreembarqueInfo(info);
    } catch (error) {
      console.error('Error loading preembarque info:', error);
    }
  };

  const handleQRScan = (data: string) => {
    try {
      const parsedData = parseQRCode(data);
      if (parsedData) {
        // Mostrar opciones: Individual o Lote
        const choice = confirm(
          `QR detectado: ${parsedData.marca}\n\n` +
          'Selecciona el tipo de registro:\n' +
          '• OK = Registro Individual\n' +
          '• Cancelar = Registro por Lote'
        );
        
        setIsQRScannerActive(false);
        
        if (choice) {
          // Registro individual
          setQrConfirmation({ show: true, data: parsedData });
        } else {
          // Registro por lote
          setBatchQRData(parsedData);
          setShowBatchEntry(true);
        }
      } else {
        alert('No se pudo procesar el código QR escaneado');
      }
    } catch (error) {
      alert('Error parsing QR code: ' + (error as Error).message);
    }
  };

  const handleQRConfirm = async (confirmedData: any) => {
    try {
      const newPieza = await RemisionService.addPiezaToRemision(
        remision.id, 
        confirmedData.marca, 
        confirmedData.cantidad, 
        confirmedData.folio
      );
      const newItem: ShipmentItem = {
        id: newPieza.id,
        marca: newPieza.marca,
        cantidad: newPieza.cantidad,
        folio: newPieza.folio,
        timestamp: new Date(newPieza.timestamp_registro)
      };
      setItems([...items, newItem]);
      setQrConfirmation({ show: false, data: null });
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('Ya existe una pieza')) {
        alert('⚠️ PIEZA DUPLICADA\n\n' + errorMessage);
      } else {
        alert('Error agregando pieza: ' + errorMessage);
      }
    }
  };

  const handleManualEntry = (data: Partial<ShipmentItem>) => {
    setManualConfirmation({ 
      show: true, 
      data: { marca: data.marca, cantidad: data.cantidad } 
    });
    setShowManualEntry(false);
  };

  const handleManualConfirm = async (confirmedData: { marca: string; cantidad: number; folio?: string }) => {
    try {
      const newPieza = await RemisionService.addPiezaToRemision(
        remision.id, 
        confirmedData.marca, 
        confirmedData.cantidad, 
        confirmedData.folio
      );
      const newItem: ShipmentItem = {
        id: newPieza.id,
        marca: newPieza.marca,
        cantidad: newPieza.cantidad,
        folio: newPieza.folio,
        timestamp: new Date(newPieza.timestamp_registro)
      };
      setItems([...items, newItem]);
      setManualConfirmation({ show: false, data: {} });
    } catch (error) {
      console.error('Error adding item:', error);
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('Ya existe una pieza') || errorMessage.includes('Ya existe un lote') || errorMessage.includes('ya existe como pieza individual')) {
        alert('⚠️ PIEZA DUPLICADA\n\n' + errorMessage);
      } else {
        alert('Error agregando pieza: ' + errorMessage);
      }
    }
  };

  const handleBatchEntry = async (batchData: { marca: string; folioInicio: number; folioFin: number; cantidad: number }) => {
    try {
      const newPieza = await RemisionService.addLoteToRemision(
        remision.id,
        batchData.marca,
        batchData.folioInicio,
        batchData.folioFin
      );

      const newItem: ShipmentItem = {
        id: newPieza.id,
        marca: newPieza.marca,
        cantidad: newPieza.cantidad,
        folio: newPieza.folio,
        timestamp: new Date(newPieza.timestamp_registro)
      };

      setItems([...items, newItem]);
      setShowBatchEntry(false);
      setBatchQRData(null); // Limpiar datos del QR
      
      // Mostrar notificación de éxito
      alert(`Lote registrado exitosamente: ${batchData.cantidad} piezas agregadas`);
    } catch (error) {
      console.error('Error adding batch:', error);
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('Ya existe un lote') || errorMessage.includes('ya existe como pieza individual')) {
        alert('⚠️ LOTE DUPLICADO\n\n' + errorMessage);
      } else {
        alert('Error registrando el lote: ' + errorMessage);
      }
    }
  };

  const handleEditItem = (item: ShipmentItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleUpdateItem = async (updatedItem: ShipmentItem) => {
    try {
      await RemisionService.updatePieza(updatedItem.id, updatedItem.marca, updatedItem.cantidad, updatedItem.folio);
      setItems(items.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      ));
      setShowEditModal(false);
      setEditingItem(null);
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('Ya existe otra pieza')) {
        alert('⚠️ PIEZA DUPLICADA\n\n' + errorMessage);
      } else {
        alert('Error actualizando pieza: ' + errorMessage);
      }
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('¿Está seguro de que desea eliminar este elemento?')) {
      try {
        await RemisionService.deletePieza(itemId);
        setItems(items.filter(item => item.id !== itemId));
      } catch (error) {
        alert('Error deleting item: ' + (error as Error).message);
      }
    }
  };

  const handleEstadoChange = (newEstado: string) => {
    onRemisionUpdated();
  };

  const handleInfoUpdated = async () => {
    try {
      await loadItems();
      await loadImages();
      await loadPreembarqueInfo();
      onRemisionUpdated();
      setShowPreembarqueForm(false);
    } catch (error) {
      alert('Error updating info: ' + (error as Error).message);
    }
  };

  const handleImageUploaded = async (file: File, description?: string) => {
    try {
      const imageUrl = await ImageService.uploadImage(remision.id, file, description);
      await loadImages(); // Reload images to show the new one
      setShowImageUpload(false);
    } catch (error) {
      alert('Error uploading image: ' + (error as Error).message);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await ImageService.deleteImage(imageId);
      setImages(images.filter(img => img.id !== imageId));
    } catch (error) {
      alert('Error deleting image: ' + (error as Error).message);
    }
  };

  const handleUpdateImageDescription = async (imageId: string, description: string) => {
    try {
      await ImageService.updateImageDescription(imageId, description);
      setImages(images.map(img => 
        img.id === imageId ? { ...img, description } : img
      ));
    } catch (error) {
      alert('Error updating image description: ' + (error as Error).message);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setGeneratingPDF(true);
      
      // Convertir items a PiezaEmbarcada format
      const piezasEmbarcadas = items.map(item => ({
        id: item.id,
        remision_id: remision.id,
        marca: item.marca,
        cantidad: item.cantidad,
        folio: item.folio,
        timestamp_registro: item.timestamp.toISOString(),
        created_at: item.timestamp.toISOString()
      }));

      await PDFService.generatePreembarqueReport(
        remision,
        piezasEmbarcadas,
        preembarqueInfo,
        images
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generando el reporte PDF: ' + (error as Error).message);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleGenerateImagePDF = async () => {
    try {
      setGeneratingPDF(true);
      await PDFService.generateImageReport(remision, images);
    } catch (error) {
      console.error('Error generating image PDF:', error);
      alert('Error generando el reporte de imágenes: ' + (error as Error).message);
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowPreembarqueForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Editar Info</span>
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={generatingPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {generatingPDF ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span>{generatingPDF ? 'Generando...' : 'Generar PDF'}</span>
          </button>
        </div>
      </div>

      {/* Remision Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Remisión #{remision.numero_remision}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Cliente:</span>
            <span className="ml-2">{remision.cliente}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Destino:</span>
            <span className="ml-2">{remision.destino}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Estado:</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
              remision.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
              remision.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {remision.estado}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Total Piezas:</span>
            <span className="ml-2 font-bold">{items.length}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <button
          onClick={() => setIsQRScannerActive(!isQRScannerActive)}
          className="flex items-center justify-center space-x-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <QrCode className="w-5 h-5" />
          <span>{isQRScannerActive ? 'Detener QR' : 'Escanear QR'}</span>
        </button>
        <button
          onClick={() => setShowManualEntry(true)}
          className="flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit3 className="w-5 h-5" />
          <span>Individual</span>
        </button>
        <button
          onClick={() => setShowBatchEntry(true)}
          className="flex items-center justify-center space-x-2 p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Package className="w-5 h-5" />
          <span>Registrar Lote</span>
        </button>
        <button
          onClick={() => setShowImageUpload(true)}
          className="flex items-center justify-center space-x-2 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Camera className="w-5 h-5" />
          <span>Subir Imagen</span>
        </button>
        <button
          onClick={handleGenerateImagePDF}
          disabled={generatingPDF || images.length === 0}
          className="flex items-center justify-center space-x-2 p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          <span>PDF Imágenes ({images.length})</span>
        </button>
      </div>

      {/* Images Gallery */}
      {images.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Imágenes del Pre-embarque</h2>
          <ImageGallery
            images={images}
            onDelete={handleDeleteImage}
            onUpdateDescription={handleUpdateImageDescription}
          />
        </div>
      )}

      {/* QR Scanner */}
      <QRScanner
        onScan={handleQRScan}
        isActive={isQRScannerActive}
        onToggle={() => setIsQRScannerActive(!isQRScannerActive)}
      />

      {/* Shipment Items Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Elementos del Embarque</h2>
        <ShipmentTable
          items={items}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
        />
      </div>

      {showManualEntry && (
        <ManualEntry
          onConfirmationRequest={handleManualEntry}
        />
      )}

      {showEditModal && editingItem && (
        <EditModal
          item={editingItem}
          onSave={handleUpdateItem}
          onClose={() => {
            setShowEditModal(false);
            setEditingItem(null);
          }}
        />
      )}

      {showPreembarqueForm && (
        <PreembarqueInfoForm
          remisionId={remision.id}
          currentEstado={remision.estado}
          onEstadoChange={handleEstadoChange}
          onInfoUpdated={handleInfoUpdated}
          onClose={() => setShowPreembarqueForm(false)}
        />
      )}

      {showImageUpload && (
        <ImageUpload
          onUpload={handleImageUploaded}
          onClose={() => setShowImageUpload(false)}
        />
      )}

      {qrConfirmation.show && (
        <QRConfirmationModal
          data={qrConfirmation.data}
          onConfirm={handleQRConfirm}
          onCancel={() => setQrConfirmation({ show: false, data: null })}
        />
      )}

      {manualConfirmation.show && (
        <ManualConfirmationModal
          data={manualConfirmation.data}
          onConfirm={handleManualConfirm}
          onCancel={() => setManualConfirmation({ show: false, data: {} })}
        />
      )}

      {showBatchEntry && (
        <BatchEntryModal
          isOpen={showBatchEntry}
          onClose={() => {
            setShowBatchEntry(false);
            setBatchQRData(null);
          }}
          onConfirm={handleBatchEntry}
          qrData={batchQRData}
        />
      )}
    </div>
  );
}