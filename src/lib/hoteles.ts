import { supabase } from "./supabaseClient";
import type { Hotel, HotelRow, TipoHospedaje } from "./types";

const TABLA = "hoteles";

function comoArreglo(valor: string[] | string | null): string[] {
  if (!valor) return [];
  if (Array.isArray(valor)) return valor;
  return valor
    .replace(/[{}]/g, "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function normalizar(fila: HotelRow): Hotel {
  return { ...fila, fotos: comoArreglo(fila.fotos) };
}

export async function obtenerHospedajes(tipo: TipoHospedaje): Promise<Hotel[]> {
  const { data, error } = await supabase
    .from(TABLA)
    .select("*")
    .eq("activo", true)
    .eq("tipo", tipo)
    .order("fecha_creacion", { ascending: false });

  if (error) {
    console.error("Error al cargar hospedajes:", error.message);
    return [];
  }
  return (data as HotelRow[]).map(normalizar);
}

export async function obtenerHospedajePorId(id: string): Promise<Hotel | null> {
  const { data, error } = await supabase.from(TABLA).select("*").eq("id", id).single();
  if (error || !data) {
    console.error("Error al cargar hospedaje:", error?.message);
    return null;
  }
  return normalizar(data as HotelRow);
}
