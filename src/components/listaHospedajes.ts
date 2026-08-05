import { obtenerHospedajes } from "@/lib/hoteles";
import { abrirModalDisponibilidad } from "@/components/modalDisponibilidad";
import type { TipoHospedaje } from "@/lib/types";

export async function renderizarListaHospedajes(
  tipo: TipoHospedaje,
  contenedorId: string
) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  contenedor.innerHTML = `<div class="spinner"></div>`;
  const hospedajes = await obtenerHospedajes(tipo);

  if (hospedajes.length === 0) {
    contenedor.innerHTML = `<p class="estado-vacio">Aún no hay opciones cargadas aquí. Vuelve pronto.</p>`;
    return;
  }

  contenedor.innerHTML = "";
  hospedajes.forEach((h) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-hospedaje";
    tarjeta.innerHTML = `
      <a href="/hotel.html?id=${h.id}" class="tarjeta-hospedaje__imagen">
        <img src="${h.fotos[0] ?? ""}" alt="${h.nombre}" loading="lazy" />
      </a>
      <div class="tarjeta-hospedaje__cuerpo">
        <span class="tarjeta-hospedaje__ubicacion">📍 ${h.ubicacion}</span>
        <a href="/hotel.html?id=${h.id}" style="text-decoration:none">
          <h3 class="tarjeta-hospedaje__nombre">${h.nombre}</h3>
        </a>
       <p class="tarjeta-hospedaje__desc">${h.descripcion}</p>
        <span class="tarjeta-producto__vermas">Ver galería y detalles →</span>
        <button class="boton boton--whatsapp" data-accion="disponibilidad">
          Consultar disponibilidad
        </button>
      </div>
    `;

    tarjeta
      .querySelector('[data-accion="disponibilidad"]')
      ?.addEventListener("click", () => abrirModalDisponibilidad(h.nombre));

    contenedor.appendChild(tarjeta);
  });
}
