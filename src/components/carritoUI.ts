import { carrito } from "@/lib/carrito";
import { formatearPrecio } from "@/lib/necesidades";
import { enviarPedidoPorWhatsApp } from "@/lib/whatsapp";
import type { ItemCarrito } from "@/lib/types";

// Controla el contador del header, el panel lateral y el envío por WhatsApp.
// Se usa tanto en index.html como en producto.html.
export function inicializarCarritoUI() {
  const contador = document.getElementById("contador-carrito");
  const botonAbrir = document.getElementById("boton-abrir-carrito");
  const botonCerrar = document.getElementById("boton-cerrar-carrito");
  const panel = document.getElementById("panel-carrito");
  const fondo = document.getElementById("panel-carrito-fondo");
  const lista = document.getElementById("lista-carrito");
  const totalEl = document.getElementById("total-carrito");
  const botonEnviar = document.getElementById("boton-enviar-pedido");

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

  function render(items: ItemCarrito[]) {
    if (contador) contador.textContent = String(carrito.cantidadTotal());
    if (totalEl) totalEl.textContent = formatearPrecio(carrito.total());

    if (!lista) return;
    lista.innerHTML = "";

    if (items.length === 0) {
      lista.innerHTML = `<p class="estado-vacio">Tu carrito está vacío. Explora el catálogo y agrega lo que necesitas.</p>`;
      return;
    }

    items.forEach((item) => {
      const fila = document.createElement("div");
      fila.className = "item-carrito";
      fila.innerHTML = `
        <div class="item-carrito__imagen">
          <img src="${item.producto.imagen_frontal_url}" alt="${item.producto.nombre}" />
        </div>
        <div class="item-carrito__info">
          <div class="item-carrito__nombre">${item.producto.nombre}</div>
          <div class="item-carrito__precio">${formatearPrecio(item.producto.precio)} · ${item.producto.presentacion}</div>
          <div class="item-carrito__controles">
            <div class="selector-cantidad">
              <button data-accion="restar" aria-label="Restar">−</button>
              <input type="text" readonly value="${item.cantidad}" aria-label="Cantidad" />
              <button data-accion="sumar" aria-label="Sumar">+</button>
            </div>
            <button class="item-carrito__quitar" data-accion="quitar">Quitar</button>
          </div>
        </div>
      `;

      fila
        .querySelector('[data-accion="restar"]')
        ?.addEventListener("click", () =>
          carrito.cambiarCantidad(item.producto.id, item.cantidad - 1)
        );
      fila
        .querySelector('[data-accion="sumar"]')
        ?.addEventListener("click", () =>
          carrito.cambiarCantidad(item.producto.id, item.cantidad + 1)
        );
      fila
        .querySelector('[data-accion="quitar"]')
        ?.addEventListener("click", () => carrito.eliminar(item.producto.id));

      lista.appendChild(fila);
    });
  }

  carrito.suscribir(render);

  botonEnviar?.addEventListener("click", () => {
    const items = carrito.obtenerItems();
    if (items.length === 0) return;
    enviarPedidoPorWhatsApp(items, carrito.total());
  });
}
