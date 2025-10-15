// Utilidad para parsear códigos QR y extraer información de las piezas
export interface ParsedQRData {
  marca: string;
  cantidad: number;
}

export const parseQRCode = (qrData: string): ParsedQRData | null => {
  const cleanData = qrData.trim();
  
  // Buscar el último pipe (|) y extraer todo lo que viene después
  if (cleanData.includes('|')) {
    const lastPipeIndex = cleanData.lastIndexOf('|');
    const marcaAfterPipe = cleanData.substring(lastPipeIndex + 1);
    
    if (marcaAfterPipe.trim()) {
      return {
        marca: marcaAfterPipe.trim(),
        cantidad: 1
      };
    }
  }
  
  // Buscar el último apostrofe (`) y extraer todo lo que viene después
  // Si contiene apostrofe (`), extraer la parte después del último
  if (cleanData.includes('`')) {
    const lastApostropheIndex = cleanData.lastIndexOf('`');
    const marcaAfterApostrophe = cleanData.substring(lastApostropheIndex + 1);
    
    if (marcaAfterApostrophe.trim()) {
      return {
        marca: marcaAfterApostrophe.trim(),
        cantidad: 1
      };
    }
  }
  
  // Fallback: extraer los últimos 8 caracteres si no hay apostrofe
  if (cleanData.length >= 8) {
    const last8Chars = cleanData.slice(-8);
    return {
      marca: last8Chars,
      cantidad: 1
    };
  }

  try {
    // Intenta parsear como JSON primero
    const jsonData = JSON.parse(qrData);
    if (jsonData.marca && jsonData.cantidad) {
      return {
        marca: jsonData.marca.toString(),
        cantidad: parseInt(jsonData.cantidad) || 1
      };
    }
  } catch {
    // Si no es JSON, intenta parsear formatos comunes
  }

  // Formato: MARCA:CANTIDAD (ej: "VIG-200X100:5")
  if (qrData.includes(':')) {
    const parts = qrData.split(':');
    if (parts.length >= 2) {
      const marca = parts[0].trim();
      const cantidad = parseInt(parts[1]) || 1;
      if (marca) {
        return { marca, cantidad };
      }
    }
  }

  // Formato: MARCA|CANTIDAD (ej: "COL-300X300|3")
  if (qrData.includes('|')) {
    const parts = qrData.split('|');
    if (parts.length >= 2) {
      const marca = parts[0].trim();
      const cantidad = parseInt(parts[1]) || 1;
      if (marca) {
        return { marca, cantidad };
      }
    }
  }

  // Formato: MARCA,CANTIDAD (ej: "TUB-100X50,10")
  if (qrData.includes(',') && qrData.split(',').length === 2) {
    const parts = qrData.split(',');
    const marca = parts[0].trim();
    const cantidadStr = parts[1].trim();
    const cantidad = parseInt(cantidadStr) || 1;
    if (marca && !isNaN(cantidad)) {
      return { marca, cantidad };
    }
  }

  // Si no se puede parsear, asume que todo el QR es la marca con cantidad 1
  if (cleanData) {
    return {
      marca: cleanData,
      cantidad: 1
    };
  }

  return null;
};