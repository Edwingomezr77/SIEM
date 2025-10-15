export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          role: 'admin' | 'user'
          full_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          role?: 'admin' | 'user'
          full_name?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          role?: 'admin' | 'user'
          full_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      remisiones: {
        Row: {
          id: string
          numero_remision: string
          cliente: string
          fecha_creacion: string
          fecha_embarque: string | null
          estado: 'pendiente' | 'embarcada' | 'entregada'
          observaciones: string
          total_piezas: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          numero_remision: string
          cliente?: string
          fecha_creacion?: string
          fecha_embarque?: string | null
          estado?: 'pendiente' | 'embarcada' | 'entregada'
          observaciones?: string
          total_piezas?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          numero_remision?: string
          cliente?: string
          fecha_creacion?: string
          fecha_embarque?: string | null
          estado?: 'pendiente' | 'embarcada' | 'entregada'
          observaciones?: string
          total_piezas?: number
          created_at?: string
          updated_at?: string
        }
      }
      piezas_embarcadas: {
        Row: {
          id: string
          remision_id: string
          marca: string
          cantidad: number
          folio: string | null
          timestamp_registro: string
          created_at: string
        }
        Insert: {
      preembarque_info: {
        Row: {
          id: string
          remision_id: string
          supervisor_obra: string
          operador: string
          telefono: string
          placas_camion: string
          transportista: string
          barrotes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          remision_id: string
          supervisor_obra?: string
          operador?: string
          telefono?: string
          placas_camion?: string
          transportista?: string
          barrotes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          remision_id?: string
          supervisor_obra?: string
          operador?: string
          telefono?: string
          placas_camion?: string
          transportista?: string
          barrotes?: string
          created_at?: string
          updated_at?: string
        }
      }
          id?: string
          remision_id: string
          marca: string
          cantidad?: number
          folio?: string | null
          timestamp_registro?: string
          created_at?: string
        }
        Update: {
          id?: string
          remision_id?: string
          marca?: string
          cantidad?: number
          folio?: string | null
          timestamp_registro?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}