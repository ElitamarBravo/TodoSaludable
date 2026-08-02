import "@/style.css";
import { inicializarSidebar } from "@/components/sidebar";
import { inicializarCarritoLotesUI } from "@/components/carritoLotesUI";
import { obtenerLotePorId } from "@/lib/lotes";
import { formatearPrecio } from "@/lib/necesidades";
import { carritoLotes } from "@/lib/carritoLotes";
import { consultarLotePorWhatsApp } from "@/lib/whatsapp";

inicializarSidebar();
inicializarCarritoLotesUI();

const contenedor = document.getElementById("contenido-lote")!;
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function iniciar() {
  if (!id) {
    contenedor.innerHTML = `<p class="estado-vacio">Lote no especificado. <a href="/bienes-raices.html">Volver</a></p>`;
    return;
  }

  contenedor.innerHTML = `<div class="spinner"></div>`;
  const lote = await obtenerLotePorId(id);

  if (!lote) {
    contenedor.innerHTML = `<p class="estado-vacio">No pudimos encontrar este lote. <a href="/bienes-raices.html">Volver</a></p>`;
    return;
  }

  document.title = `${lote.nombre} · Bienes y Raíces Kalomai`;

  contenedor.innerHTML = `
    <div class="producto-detalle">
      <div class="producto-detalle__galeria">
        <div class="producto-detalle__imagen-principal">
          <img id="imagen-principal-lote" src="${lote.fotos[0] ?? ""}" alt="${lote.nombre}" />
        </div>
        ${
          lote.fotos.length > 1
            ? `<div class="producto-detalle__miniaturas">
                ${lote.fotos
                  .map(
                    (img, i) =>
                      `<button data-src="${img}" class="${i === 0 ? "activa" : ""}"><img src="${img}" alt="Vista ${i + 1}" /></button>`
                  )
                  .join("")}
              </div>`
            : ""
        }
      </div>
      <div>
        <span class="producto-detalle__categoria">📍 ${lote.ubicacion}</span>
        <h1 class="producto-detalle__nombre">${lote.nombre}</h1>
        <div class="producto-detalle__precio">${formatearPrecio(lote.precio)}</div>
        <p class="producto-detalle__descripcion">${lote.descripcion}</p>
        <div class="producto-detalle__acciones">
          <button id="agregar-carrito-lote" class="boton boton--primario" ${lote.disponible ? "" : "disabled"}>
            ${lote.disponible ? "Agregar a lotes de interés" : "No disponible"}
          </button>
          <button id="consultar-lote-whatsapp" class="boton boton--whatsapp">
            Consultar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll("[data-src]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-src")!;
      (document.getElementById("imagen-principal-lote") as HTMLImageElement).src = src;
      document.querySelectorAll("[data-src]").forEach((b) => b.classList.remove("activa"));
      btn.classList.add("activa");
    });
  });

  document.getElementById("agregar-carrito-lote")?.addEventListener("click", () => {
    carritoLotes.agregar(lote, 1);
    document.getElementById("boton-abrir-carrito-lotes")?.dispatchEvent(new Event("click"));
  });

  document
    .getElementById("consultar-lote-whatsapp")
    ?.addEventListener("click", () => consultarLotePorWhatsApp(lote.nombre));
}

iniciar();
