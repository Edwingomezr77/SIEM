import { supabase } from '../lib/supabase';
import { Remision, PiezaEmbarcada, RemisionWithPiezas, PreembarqueInfo } from '../types/database';

export class RemisionService {
  // Obtener todas las remisiones
  static async getAllRemisiones(): Promise<Remision[]> {
    const { data, error } = await supabase
      .from('remisiones')
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Crear nueva remisión
  static async createRemision(numeroRemision: string, proyecto: string): Promise<Remision> {
    const { data, error } = await supabase
      .from('remisiones')
      .insert({
        numero_remision: numeroRemision,
        cliente: proyecto,
        estado: 'pendiente'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Obtener remisión con sus piezas
  static async getRemisionWithPiezas(remisionId: string): Promise<RemisionWithPiezas | null> {
    const { data, error } = await supabase
      .from('remisiones')
      .select(`
        *,
        piezas_embarcadas (*)
      `)
      .eq('id', remisionId)
      .single();

    if (error) throw error;
    return data;
  }

  // Buscar remisión por número
  static async findRemisionByNumero(numeroRemision: string): Promise<Remision | null> {
    const { data, error } = await supabase
      .from('remisiones')
      .select('*')
      .eq('numero_remision', numeroRemision)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }

  // Agregar pieza a remisión
  static async addPiezaToRemision(remisionId: string, marca: string, cantidad: number, folio?: string): Promise<PiezaEmbarcada> {
    // Verificar si ya existe una pieza con la misma marca y folio
    if (folio) {
      const { data: existingPieza, error: checkError } = await supabase
        .from('piezas_embarcadas')
        .select('id')
        .eq('remision_id', remisionId)
        .eq('marca', marca)
        .eq('folio', folio)
        .maybeSingle();

      if (checkError) throw checkError;
      
      if (existingPieza) {
        throw new Error(`Ya existe una pieza con marca "${marca}" y folio "${folio}" en este pre-embarque`);
      }
    }

    const { data, error } = await supabase
      .from('piezas_embarcadas')
      .insert({
        remision_id: remisionId,
        marca: marca,
        cantidad: cantidad,
        folio: folio || null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Agregar lote de piezas a remisión
  static async addLoteToRemision(
    remisionId: string, 
    marca: string, 
    folioInicio: number, 
    folioFin: number
  ): Promise<PiezaEmbarcada> {
    const folioRango = `${folioInicio}-${folioFin}`;
    
    // Verificar si ya existe un lote con la misma marca y rango de folios
    const { data: existingLote, error: checkError } = await supabase
      .from('piezas_embarcadas')
      .select('id')
      .eq('remision_id', remisionId)
      .eq('marca', marca)
      .eq('folio', folioRango)
      .maybeSingle();

    if (checkError) throw checkError;
    
    if (existingLote) {
      throw new Error(`Ya existe un lote con marca "${marca}" y rango de folios "${folioRango}" en este pre-embarque`);
    }

    // También verificar si algún folio individual del rango ya existe
    for (let i = folioInicio; i <= folioFin; i++) {
      const { data: existingIndividual, error: individualCheckError } = await supabase
        .from('piezas_embarcadas')
        .select('id, folio')
        .eq('remision_id', remisionId)
        .eq('marca', marca)
        .eq('folio', i.toString())
        .maybeSingle();

      if (individualCheckError) throw individualCheckError;
      
      if (existingIndividual) {
        throw new Error(`El folio "${i}" de la marca "${marca}" ya existe como pieza individual en este pre-embarque`);
      }
    }

    const cantidad = folioFin - folioInicio + 1;
    
    // Insertar una sola entrada que represente todo el lote
    const { data, error } = await supabase
      .from('piezas_embarcadas')
      .insert({
        remision_id: remisionId,
        marca: marca,
        cantidad: cantidad,
        folio: folioRango
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Eliminar pieza
  static async deletePieza(piezaId: string): Promise<void> {
    const { error } = await supabase
      .from('piezas_embarcadas')
      .delete()
      .eq('id', piezaId);

    if (error) throw error;
  }

  // Actualizar pieza
  static async updatePieza(piezaId: string, marca: string, cantidad: number, folio?: string): Promise<void> {
    // Si se está actualizando el folio, verificar que no exista duplicado
    if (folio) {
      // Primero obtener la pieza actual para saber su remision_id
      const { data: currentPieza, error: getCurrentError } = await supabase
        .from('piezas_embarcadas')
        .select('remision_id')
        .eq('id', piezaId)
        .single();

      if (getCurrentError) throw getCurrentError;

      // Verificar si ya existe otra pieza con la misma marca y folio (excluyendo la actual)
      const { data: existingPieza, error: checkError } = await supabase
        .from('piezas_embarcadas')
        .select('id')
        .eq('remision_id', currentPieza.remision_id)
        .eq('marca', marca)
        .eq('folio', folio)
        .neq('id', piezaId)
        .maybeSingle();

      if (checkError) throw checkError;
      
      if (existingPieza) {
        throw new Error(`Ya existe otra pieza con marca "${marca}" y folio "${folio}" en este pre-embarque`);
      }
    }

    const { error } = await supabase
      .from('piezas_embarcadas')
      .update({ marca, cantidad, folio: folio || null })
      .eq('id', piezaId);

    if (error) throw error;
  }

  // Actualizar estado de remisión
  static async updateRemisionEstado(remisionId: string, estado: 'pendiente' | 'embarcada' | 'entregada'): Promise<void> {
    const { error } = await supabase
      .from('remisiones')
      .update({ estado })
      .eq('id', remisionId);

    if (error) throw error;
  }

  // Actualizar observaciones (folio) de remisión
  static async updateRemisionObservaciones(remisionId: string, observaciones: string): Promise<void> {
    const { error } = await supabase
      .from('remisiones')
      .update({ observaciones })
      .eq('id', remisionId);

    if (error) throw error;
  }

  // Obtener información del pre-embarque
  static async getPreembarqueInfo(remisionId: string): Promise<PreembarqueInfo | null> {
    const { data, error } = await supabase
      .from('preembarque_info')
      .select('*')
      .eq('remision_id', remisionId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Crear o actualizar información del pre-embarque
  static async upsertPreembarqueInfo(
    remisionId: string,
    info: Partial<Omit<PreembarqueInfo, 'id' | 'remision_id' | 'created_at' | 'updated_at'>>
  ): Promise<PreembarqueInfo> {
    const { data, error } = await supabase
      .from('preembarque_info')
      .upsert({
        remision_id: remisionId,
        ...info
      }, {
        onConflict: 'remision_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}