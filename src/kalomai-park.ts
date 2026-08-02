import "@/style.css";
import { inicializarSidebar } from "@/components/sidebar";
import { obtenerGaleriaPark } from "@/lib/parkGaleria";
import { solicitarMembresiaPark } from "@/lib/whatsapp";

inicializarSidebar();

document
  .getElementById("boton-membresia-park")
  ?.addEventListener("click", solicitarMembresiaPark);

async function iniciar() {
  const contenedor = document.getElementById("galeria-park")!;
  contenedor.innerHTML = `<div class="spinner"></div>`;
  const fotos = await obtenerGaleriaPark();

  if (fotos.length === 0) {
    contenedor.innerHTML = `<p class="estado-vacio">Pronto vas a poder ver fotos del parque aquí.</p>`;
    return;
  }

  contenedor.innerHTML = "";
  fotos.forEach((f) => {
    const item = document.createElement("div");
    item.className = "galeria-simple__item";
    item.innerHTML = `<img src="${f.imagen_url}" alt="${f.descripcion || "Kalomai Park"}" loading="lazy" />`;
    contenedor.appendChild(item);
  });
}

iniciar();
