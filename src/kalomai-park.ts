import "@/style.css";
import { inicializarSidebar } from "@/components/sidebar";
import { obtenerGaleriaPark } from "@/lib/parkGaleria";
import { solicitarMembresiaPark } from "@/lib/whatsapp";
import type { FotoPark } from "@/lib/types";

inicializarSidebar();

document
  .getElementById("boton-membresia-park")
  ?.addEventListener("click", solicitarMembresiaPark);

interface GrupoFotos {
  titulo: string;
  fotos: FotoPark[];
}

// Agrupa las fotos: cada foto CON descripción abre un grupo nuevo.
// Las fotos SIN descripción que siguen (según "orden") se acomodan
// dentro del último grupo abierto.
function agruparFotos(fotos: FotoPark[]): GrupoFotos[] {
  const grupos: GrupoFotos[] = [];

  fotos.forEach((foto) => {
    const tieneDescripcion = foto.descripcion.trim().length > 0;
    if (tieneDescripcion || grupos.length === 0) {
      grupos.push({ titulo: foto.descripcion.trim(), fotos: [foto] });
    } else {
      grupos[grupos.length - 1].fotos.push(foto);
    }
  });

  return grupos;
}

async function iniciar() {
  const contenedor = document.getElementById("galeria-park")!;
  contenedor.innerHTML = `<div class="spinner"></div>`;
  const fotos = await obtenerGaleriaPark();

  if (fotos.length === 0) {
    contenedor.innerHTML = `<p class="estado-vacio">Pronto vas a poder ver fotos del parque aquí.</p>`;
    return;
  }

  const grupos = agruparFotos(fotos);
  contenedor.innerHTML = "";

  grupos.forEach((grupo) => {
    const seccion = document.createElement("div");
    seccion.className = "galeria-grupo";

    if (grupo.titulo) {
      const titulo = document.createElement("h3");
      titulo.className = "galeria-grupo__titulo";
      titulo.textContent = grupo.titulo;
      seccion.appendChild(titulo);
    }

    const grid = document.createElement("div");
    grid.className = "galeria-simple";
    grupo.fotos.forEach((f) => {
      const item = document.createElement("div");
      item.className = "galeria-simple__item";
      item.innerHTML = `<img src="${f.imagen_url}" alt="${grupo.titulo || "Kalomai Park"}" loading="lazy" />`;
      grid.appendChild(item);
    });
    seccion.appendChild(grid);

    contenedor.appendChild(seccion);
  });
}

iniciar();