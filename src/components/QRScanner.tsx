import React, { useRef, useEffect, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Camera, CameraOff, X, Zap } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, isActive, onToggle }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        setScanning(true);
        // Vibración en móviles si está disponible
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
        onScan(result.data);
        setTimeout(() => setScanning(false), 1000);
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: 'environment', // Cámara trasera por defecto
        maxScansPerSecond: 5,
        returnDetailedScanResult: true,
      }
    );

    scannerRef.current = scanner;

    // Verificar capacidades de la cámara
    QrScanner.hasCamera().then(setHasCamera);

    return () => {
      scanner.destroy();
    };
  }, [onScan]);

  useEffect(() => {
    if (!scannerRef.current) return;

    if (isActive && hasCamera) {
      scannerRef.current.start().then(() => {
        // Verificar si tiene flash después de iniciar
        scannerRef.current?.hasFlash().then(setHasFlash);
      }).catch((error) => {
        console.error('Error starting scanner:', error);
        setHasCamera(false);
      });
    } else {
      scannerRef.current.stop();
      setFlashOn(false);
    }
  }, [isActive, hasCamera]);

  const toggleFlash = async () => {
    if (scannerRef.current && hasFlash) {
      try {
        if (flashOn) {
          await scannerRef.current.turnFlashOff();
          setFlashOn(false);
        } else {
          await scannerRef.current.turnFlashOn();
          setFlashOn(true);
        }
      } catch (error) {
        console.error('Error toggling flash:', error);
      }
    }
  };

  if (!hasCamera) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <CameraOff className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Cámara no disponible</h3>
          <p className="text-gray-600 mb-4">
            Por favor, permite el acceso a la cámara para escanear códigos QR
          </p>
          <p className="text-sm text-gray-500">
            Asegúrate de que tu navegador tenga permisos para acceder a la cámara
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Camera className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Escáner QR</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Flash toggle */}
          {hasFlash && isActive && (
            <button
              onClick={toggleFlash}
              className={`p-2 rounded-lg transition-colors ${
                flashOn
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title={flashOn ? 'Apagar flash' : 'Encender flash'}
            >
              <Zap className="w-5 h-5" />
            </button>
          )}
          
          {/* Start/Stop button */}
          <button
            onClick={onToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isActive ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
            {isActive ? 'Detener' : 'Iniciar'}
          </button>
        </div>
      </div>
      
      {/* Scanner Area */}
      <div className="relative bg-black">
        <video
          ref={videoRef}
          className={`w-full transition-all ${
            isActive ? 'block' : 'hidden'
          }`}
          style={{ 
            aspectRatio: '4/3',
            objectFit: 'cover',
            maxHeight: '400px'
          }}
          playsInline
          muted
        />
        
        {!isActive && (
          <div 
            className="w-full bg-gray-900 flex items-center justify-center text-white"
            style={{ aspectRatio: '4/3', maxHeight: '400px' }}
          >
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Escáner QR</p>
              <p className="text-gray-400">Presiona "Iniciar" para comenzar</p>
            </div>
          </div>
        )}

        {/* Scanning overlay */}
        {isActive && (
          <>
            {/* Corner guides */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-transparent">
                {/* Top-left corner */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                {/* Top-right corner */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                {/* Bottom-left corner */}
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                {/* Bottom-right corner */}
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <div className="bg-black bg-opacity-75 rounded-lg px-4 py-2">
                <p className="text-white text-sm font-medium">
                  {scanning ? '¡Código detectado!' : 'Apunta la cámara hacia el código QR'}
                </p>
              </div>
            </div>

            {/* Scanning animation */}
            {scanning && (
              <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium">
                  ✓ Escaneado exitosamente
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Instructions */}
      {isActive && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Mantén el código dentro del marco</span>
            </div>
            {hasFlash && (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Usa el flash en lugares oscuros</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};