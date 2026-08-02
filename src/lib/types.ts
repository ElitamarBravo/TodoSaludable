// Tipos centrales del dominio "Todo Saludable con María Isabel"

export type NecesidadId =
  | "bienestar-general"
  | "huesos-articulaciones"
  | "belleza-piel-vitalidad"
  | "cerebro-memoria-energia"
  | "digestion-interna"
  | "vitaminas-fortalecimiento"
  | "control-corporal";

export interface Necesidad {
  id: NecesidadId;
  nombre: string;
  icono: string; // emoji o nombre de icono
  descripcion: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  necesidad_relacionada: NecesidadId;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  necesidades: NecesidadId[];
  presentacion: string;
  tamano: string;
  beneficios: string[];
  modo_uso: string;
  stock: number;
  imagen_frontal_url: string;
  imagen_posterior_url: string | null;
  activo: boolean;
  fecha_creacion: string;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

// Forma cruda que puede devolver Supabase antes de normalizar
export interface ProductoRow {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  necesidades: string[] | string | null;
  presentacion: string;
  tamano: string;
  beneficios: string[] | string | null;
  modo_uso: string;
  stock: number;
  imagen_frontal_url: string;
  imagen_posterior_url: string | null;
  activo: boolean;
  fecha_creacion: string;
}

// ============================================================
// Kalomai — hoteles/resort (Travel), lotes (Bienes y Raíces)
// y galería de Kalomai Park
// ============================================================

export type TipoHospedaje = "hotel" | "resort";

export interface Hotel {
  id: string;
  nombre: string;
  tipo: TipoHospedaje;
  descripcion: string;
  ubicacion: string;
  fotos: string[];
  activo: boolean;
  fecha_creacion: string;
}

export interface HotelRow {
  id: string;
  nombre: string;
  tipo: TipoHospedaje;
  descripcion: string;
  ubicacion: string;
  fotos: string[] | string | null;
  activo: boolean;
  fecha_creacion: string;
}

export interface Lote {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  ubicacion: string;
  fotos: string[];
  disponible: boolean;
  activo: boolean;
  fecha_creacion: string;
}

export interface LoteRow {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  ubicacion: string;
  fotos: string[] | string | null;
  disponible: boolean;
  activo: boolean;
  fecha_creacion: string;
}

export interface FotoPark {
  id: string;
  imagen_url: string;
  descripcion: string;
  orden: number;
  activo: boolean;
}

export interface ItemLote {
  lote: Lote;
  cantidad: number;
}

export interface ConsultaDisponibilidad {
  fecha: string;
  personas: number;
  dias: number;
}
