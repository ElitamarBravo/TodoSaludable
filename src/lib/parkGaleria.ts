import { supabase } from "./supabaseClient";
import type { FotoPark } from "./types";

const TABLA = "park_galeria";

export async function obtenerGaleriaPark(): Promise<FotoPark[]> {
  const { data, error } = await supabase
    .from(TABLA)
    .select("*")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error al cargar galería de Park:", error.message);
    return [];
  }
  return data as FotoPark[];
}
