import "@/style.css";
import { inicializarSidebar } from "@/components/sidebar";
import { inicializarCarritoLotesUI } from "@/components/carritoLotesUI";
import { obtenerLotes } from "@/lib/lotes";
import { formatearPrecio } from "@/lib/necesidades";
import type { Lote } from "@/lib/types";

inicializarSidebar();
inicializarCarritoLotesUI();

async function iniciar() {
  const grid = document.getElementById("grid-lotes")!;
  grid.innerHTML = `<div class="spinner"></div>`;
  const lotes: Lote[] = await obtenerLotes();

  if (lotes.length === 0) {
    grid.innerHTML = `<p class="estado-vacio">Aún no hay lotes cargados. Vuelve pronto o consulta por WhatsApp.</p>`;
    return;
  }

  grid.innerHTML = "";
  lotes.forEach((lote) => {
    const tarjeta = document.createElement("a");
    tarjeta.className = "tarjeta-producto";
    tarjeta.href = `/lote.html?id=${lote.id}`;
    tarjeta.innerHTML = `
      <div class="tarjeta-producto__imagen">
        <img src="${lote.fotos[0] ?? ""}" alt="${lote.nombre}" loading="lazy" />
      </div>
      <div class="tarjeta-producto__cuerpo">
        <span class="tarjeta-producto__categoria">📍 ${lote.ubicacion}</span>
        <h3 class="tarjeta-producto__nombre">${lote.nombre}</h3>
        <span class="tarjeta-producto__precio">${formatearPrecio(lote.precio)}</span>
              <span class="tarjeta-producto__stock ${lote.disponible ? "" : "agotado"}">
          ${lote.disponible ? "Disponible" : "No disponible"}
        </span>
        <span class="tarjeta-producto__vermas">Ver detalles →</span>
      </div>
    `;
    grid.appendChild(tarjeta);
  });
}

iniciar();
