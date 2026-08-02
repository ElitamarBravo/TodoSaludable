import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // No lanzamos un error duro para que la UI pueda mostrar un aviso amigable
  // en vez de una pantalla en blanco si falta configurar el archivo .env
  console.warn(
    "[Supabase] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. " +
      "Copia .env.example a .env y completa tus credenciales de Supabase."
  );
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-key"
);

export const supabaseConfigurado = Boolean(supabaseUrl && supabaseAnonKey);

// Carpeta base del bucket público "productos" en Supabase Storage
export const BUCKET_PRODUCTOS = "productos";
export const BUCKET_PERFIL = "perfil";
// Fotos de hoteles/resort, lotes y galería de Kalomai Park
export const BUCKET_KALOMAI = "kalomai";

export function urlPublicaStorage(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
