export interface Remision {
  id: string;
  numero_remision: string;
  cliente: string;
  fecha_creacion: string;
  fecha_embarque: string | null;
  estado: 'pendiente' | 'embarcada' | 'entregada';
  observaciones: string;
  total_piezas: number;
  created_at: string;
  updated_at: string;
}

export interface PiezaEmbarcada {
  id: string;
  remision_id: string;
  marca: string;
  cantidad: number;
  folio: string | null;
  timestamp_registro: string;
  created_at: string;
}

export interface RemisionWithPiezas extends Remision {
  piezas_embarcadas: PiezaEmbarcada[];
}

export interface ShipmentItem {
  id: string;
  marca: string;
  cantidad: number;
  folio?: string | null;
  timestamp: Date;
}

export interface PreembarqueInfo {
  id: string;
  remision_id: string;
  supervisor_obra: string;
  operador: string;
  telefono: string;
  placas_camion: string;
  transportista: string;
  barrotes: string;
  created_at: string;
  updated_at: string;
}

export interface RemisionImage {
  id: string;
  remision_id: string;
  image_url: string;
  image_name: string;
  description: string;
  created_at: string;
}