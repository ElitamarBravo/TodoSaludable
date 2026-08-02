import "@/style.css";
import { inicializarSidebar } from "@/components/sidebar";
import { obtenerHospedajePorId } from "@/lib/hoteles";
import { abrirModalDisponibilidad } from "@/components/modalDisponibilidad";

inicializarSidebar();

const contenedor = document.getElementById("contenido-hotel")!;
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function iniciar() {
  if (!id) {
    contenedor.innerHTML = `<p class="estado-vacio">Hospedaje no especificado. <a href="/kalomai-travel.html">Volver</a></p>`;
    return;
  }

  contenedor.innerHTML = `<div class="spinner"></div>`;
  const hotel = await obtenerHospedajePorId(id);

  if (!hotel) {
    contenedor.innerHTML = `<p class="estado-vacio">No pudimos encontrar este hospedaje. <a href="/kalomai-travel.html">Volver</a></p>`;
    return;
  }

  document.title = `${hotel.nombre} · Kalomai`;
  const volverA = hotel.tipo === "resort" ? "/kalomai-resort.html" : "/kalomai-travel.html";

  contenedor.innerHTML = `
    <div class="producto-detalle">
      <div class="producto-detalle__galeria">
        <div class="producto-detalle__imagen-principal">
          <img id="imagen-principal-hotel" src="${hotel.fotos[0] ?? ""}" alt="${hotel.nombre}" />
        </div>
        ${
          hotel.fotos.length > 1
            ? `<div class="producto-detalle__miniaturas">
                ${hotel.fotos
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
        <span class="producto-detalle__categoria">📍 ${hotel.ubicacion}</span>
        <h1 class="producto-detalle__nombre">${hotel.nombre}</h1>
        <p class="producto-detalle__descripcion">${hotel.descripcion}</p>
        <div class="producto-detalle__acciones">
          <button id="boton-consultar-disponibilidad" class="boton boton--whatsapp">
            Consultar disponibilidad
          </button>
        </div>
        <p style="margin-top:20px"><a href="${volverA}">← Volver a ${hotel.tipo === "resort" ? "Kalomai Resort" : "Kalomai Travel"}</a></p>
      </div>
    </div>
  `;

  document.querySelectorAll("[data-src]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-src")!;
      (document.getElementById("imagen-principal-hotel") as HTMLImageElement).src = src;
      document.querySelectorAll("[data-src]").forEach((b) => b.classList.remove("activa"));
      btn.classList.add("activa");
    });
  });

  document
    .getElementById("boton-consultar-disponibilidad")
    ?.addEventListener("click", () => abrirModalDisponibilidad(hotel.nombre));
}

iniciar();
