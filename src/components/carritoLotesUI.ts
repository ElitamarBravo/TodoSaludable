import { carritoLotes } from "@/lib/carritoLotes";
import { formatearPrecio } from "@/lib/necesidades";
import { enviarPedidoLotesPorWhatsApp } from "@/lib/whatsapp";
import type { ItemLote } from "@/lib/types";

export function inicializarCarritoLotesUI() {
  const contador = document.getElementById("contador-carrito-lotes");
  const botonAbrir = document.getElementById("boton-abrir-carrito-lotes");
  const botonCerrar = document.getElementById("boton-cerrar-carrito-lotes");
  const panel = document.getElementById("panel-carrito-lotes");
  const fondo = document.getElementById("panel-carrito-lotes-fondo");
  const lista = document.getElementById("lista-carrito-lotes");
  const totalEl = document.getElementById("total-carrito-lotes");
  const botonEnviar = document.getElementById("boton-enviar-pedido-lotes");

  function abrir() {
    panel?.classList.add("abierto");
    fondo?.classList.add("visible");
  }
  function cerrar() {
    panel?.classList.remove("abierto");
    fondo?.classList.remove("visible");
  }

  botonAbrir?.addEventListener("click", abrir);
  botonCerrar?.addEventListener("click", cerrar);
  fondo?.addEventListener("click", cerrar);

  function render(items: ItemLote[]) {
    if (contador) contador.textContent = String(carritoLotes.cantidadTotal());
    if (totalEl) totalEl.textContent = formatearPrecio(carritoLotes.total());
    if (!lista) return;
    lista.innerHTML = "";

    if (items.length === 0) {
      lista.innerHTML = `<p class="estado-vacio">Aún no agregaste lotes de interés.</p>`;
      return;
    }

    items.forEach((item) => {
      const fila = document.createElement("div");
      fila.className = "item-carrito";
      fila.innerHTML = `
        <div class="item-carrito__imagen">
          <img src="${item.lote.fotos[0] ?? ""}" alt="${item.lote.nombre}" />
        </div>
        <div class="item-carrito__info">
          <div class="item-carrito__nombre">${item.lote.nombre}</div>
          <div class="item-carrito__precio">${formatearPrecio(item.lote.precio)} · ${item.lote.ubicacion}</div>
          <div class="item-carrito__controles">
            <div class="selector-cantidad">
              <button data-accion="restar">−</button>
              <input type="text" readonly value="${item.cantidad}" />
              <button data-accion="sumar">+</button>
            </div>
            <button class="item-carrito__quitar" data-accion="quitar">Quitar</button>
          </div>
        </div>
      `;

      fila
        .querySelector('[data-accion="restar"]')
        ?.addEventListener("click", () =>
          carritoLotes.cambiarCantidad(item.lote.id, item.cantidad - 1)
        );
      fila
        .querySelector('[data-accion="sumar"]')
        ?.addEventListener("click", () =>
          carritoLotes.cambiarCantidad(item.lote.id, item.cantidad + 1)
        );
      fila
        .querySelector('[data-accion="quitar"]')
        ?.addEventListener("click", () => carritoLotes.eliminar(item.lote.id));

      lista.appendChild(fila);
    });
  }

  carritoLotes.suscribir(render);

  botonEnviar?.addEventListener("click", () => {
    const items = carritoLotes.obtenerItems();
    if (items.length === 0) return;
    enviarPedidoLotesPorWhatsApp(items, carritoLotes.total());
  });
}
