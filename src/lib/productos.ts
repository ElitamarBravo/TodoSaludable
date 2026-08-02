import { supabase } from "./supabaseClient";
import { normalizarProducto } from "./necesidades";
import type { NecesidadId, Producto, ProductoRow } from "./types";

const TABLA = "productos";

export async function obtenerTodosLosProductos(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from(TABLA)
    .select("*")
    .eq("activo", true)
    .order("fecha_creacion", { ascending: false });

  if (error) {
    console.error("Error al cargar productos:", error.message);
    return [];
  }
  return (data as ProductoRow[]).map(normalizarProducto);
}

export async function obtenerProductoPorId(
  id: string
): Promise<Producto | null> {
  const { data, error } = await supabase
    .from(TABLA)
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error al cargar producto:", error?.message);
    return null;
  }
  return normalizarProducto(data as ProductoRow);
}

export async function obtenerProductosPorNecesidad(
  necesidad: NecesidadId
): Promise<Producto[]> {
  // El filtro por array (contains) se hace del lado del servidor cuando la
  // columna "necesidades" es de tipo text[] en Postgres.
  const { data, error } = await supabase
    .from(TABLA)
    .select("*")
    .eq("activo", true)
    .contains("necesidades", [necesidad]);

  if (error) {
    console.error("Error al filtrar por necesidad:", error.message);
    return [];
  }
  return (data as ProductoRow[]).map(normalizarProducto);
}

export function buscarProductos(
  productos: Producto[],
  termino: string
): Producto[] {
  const t = termino.trim().toLowerCase();
  if (!t) return productos;
  return productos.filter((p) => {
    const enTexto =
      p.nombre.toLowerCase().includes(t) ||
      p.descripcion.toLowerCase().includes(t) ||
      p.categoria.toLowerCase().includes(t) ||
      p.beneficios.some((b) => b.toLowerCase().includes(t));
    const enNecesidades = p.necesidades.some((n) =>
      n.replace(/-/g, " ").includes(t)
    );
    return enTexto || enNecesidades;
  });
}
