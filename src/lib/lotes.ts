import { supabase } from "./supabaseClient";
import type { Lote, LoteRow } from "./types";

const TABLA = "lotes";

function comoArreglo(valor: string[] | string | null): string[] {
  if (!valor) return [];
  if (Array.isArray(valor)) return valor;
  return valor
    .replace(/[{}]/g, "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function normalizar(fila: LoteRow): Lote {
  return { ...fila, fotos: comoArreglo(fila.fotos) };
}

export async function obtenerLotes(): Promise<Lote[]> {
  const { data, error } = await supabase
    .from(TABLA)
    .select("*")
    .eq("activo", true)
    .order("fecha_creacion", { ascending: false });

  if (error) {
    console.error("Error al cargar lotes:", error.message);
    return [];
  }
  return (data as LoteRow[]).map(normalizar);
}

export async function obtenerLotePorId(id: string): Promise<Lote | null> {
  const { data, error } = await supabase.from(TABLA).select("*").eq("id", id).single();
  if (error || !data) {
    console.error("Error al cargar lote:", error?.message);
    return null;
  }
  return normalizar(data as LoteRow);
}
