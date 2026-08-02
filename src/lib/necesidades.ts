import type { Necesidad, NecesidadId, Producto, ProductoRow } from "./types";

// Las 7 necesidades fijas del negocio. El texto y los iconos viven aquí
// para que toda la app (inicio, buscador, catálogo, admin) use la misma fuente.
export const NECESIDADES: Necesidad[] = [
  {
    id: "bienestar-general",
    nombre: "Bienestar general",
    icono: "🌿",
    descripcion: "Mantenimiento y cuidado diario",
  },
  {
    id: "huesos-articulaciones",
    nombre: "Huesos, articulaciones y movilidad",
    icono: "🦴",
    descripcion: "Colágenos, cartílagos y minerales",
  },
  {
    id: "belleza-piel-vitalidad",
    nombre: "Belleza, piel y vitalidad",
    icono: "✨",
    descripcion: "Piel, cabello, uñas y vitalidad",
  },
  {
    id: "cerebro-memoria-energia",
    nombre: "Cerebro, memoria y energía",
    icono: "🧠",
    descripcion: "Concentración, energía y vitalidad mental",
  },
  {
    id: "digestion-interna",
    nombre: "Digestión y bienestar interno",
    icono: "🩺",
    descripcion: "Fibras, probióticos y digestión",
  },
  {
    id: "vitaminas-fortalecimiento",
    nombre: "Vitaminas y fortalecimiento",
    icono: "💪",
    descripcion: "Vitaminas, minerales y complementos",
  },
  {
    id: "control-corporal",
    nombre: "Control y bienestar corporal",
    icono: "⚖️",
    descripcion: "Apoyo metabólico y planes alimenticios",
  },
];

export function necesidadPorId(id: string): Necesidad | undefined {
  return NECESIDADES.find((n) => n.id === id);
}

function comoArreglo(valor: string[] | string | null): string[] {
  if (!valor) return [];
  if (Array.isArray(valor)) return valor;
  // Supabase puede devolver arrays de texto como "{a,b,c}" en algunos casos
  return valor
    .replace(/[{}]/g, "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

// Normaliza una fila cruda de Supabase a nuestro tipo Producto de dominio.
export function normalizarProducto(fila: ProductoRow): Producto {
  return {
    ...fila,
    necesidades: comoArreglo(fila.necesidades) as NecesidadId[],
    beneficios: comoArreglo(fila.beneficios),
  };
}

export function formatearPrecio(precio: number): string {
  return `Bs. ${precio.toFixed(2)}`;
}
