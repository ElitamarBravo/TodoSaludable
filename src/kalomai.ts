import "@/style.css";
import { inicializarSidebar } from "@/components/sidebar";
import { urlPublicaStorage, BUCKET_PERFIL } from "@/lib/supabaseClient";

inicializarSidebar();

const fotoAsesora = document.getElementById(
  "foto-asesora-kalomai"
) as HTMLImageElement | null;
if (fotoAsesora) {
  fotoAsesora.src = urlPublicaStorage(BUCKET_PERFIL, "maria-isabel/perfil.jpg");
  fotoAsesora.onerror = () => {
    fotoAsesora.src =
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='100%' height='100%' fill='#a9c2ae'/><text x='50%' y='50%' font-family='sans-serif' font-size='12' fill='#2F4A3C' text-anchor='middle'>MI</text></svg>`
      );
  };
}
