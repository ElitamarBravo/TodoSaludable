import "@/style.css";
import { inicializarSidebar } from "@/components/sidebar";
import { obtenerProductoPorId } from "@/lib/productos";
import { formatearPrecio } from "@/lib/necesidades";
import { necesidadPorId } from "@/lib/necesidades";
import { carrito } from "@/lib/carrito";
import { consultarProductoPorWhatsApp } from "@/lib/whatsapp";
import { inicializarCarritoUI } from "@/components/carritoUI";

inicializarSidebar();
inicializarCarritoUI();

const contenedor = document.getElementById("contenido-producto")!;
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function iniciar() {
  if (!id) {
    contenedor.innerHTML = `<p class="estado-vacio">Producto no especificado. <a href="/">Volver al catálogo</a></p>`;
    return;
  }

  contenedor.innerHTML = `<div class="spinner"></div>`;
  const producto = await obtenerProductoPorId(id);

  if (!producto) {
    contenedor.innerHTML = `<p class="estado-vacio">No pudimos encontrar este producto. <a href="/">Volver al catálogo</a></p>`;
    return;
  }

  document.title = `${producto.nombre} · Todo Saludable con María Isabel`;

  const imagenes = [producto.imagen_frontal_url, producto.imagen_posterior_url].filter(
    Boolean
  ) as string[];

  const necesidadesTexto = producto.necesidades
    .map((n) => necesidadPorId(n)?.nombre ?? n)
    .join(", ");

  contenedor.innerHTML = `
    <div class="producto-detalle">
      <div class="producto-detalle__galeria">
        <div class="producto-detalle__imagen-principal">
          <img id="imagen-principal" src="${imagenes[0]}" alt="${producto.nombre}" />
        </div>
        ${
          imagenes.length > 1
            ? `<div class="producto-detalle__miniaturas">
                ${imagenes
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
        <span class="producto-detalle__categoria">${producto.categoria}</span>
        <h1 class="producto-detalle__nombre">${producto.nombre}</h1>
        <div class="producto-detalle__precio">${formatearPrecio(producto.precio)}</div>
        <div class="producto-detalle__meta">${producto.presentacion} · ${producto.tamano}</div>
        <p class="producto-detalle__descripcion">${producto.descripcion}</p>

        ${
          producto.beneficios.length
            ? `<div class="producto-detalle__bloque">
                <h3>Beneficios</h3>
                <ul>${producto.beneficios.map((b) => `<li>${b}</li>`).join("")}</ul>
              </div>`
            : ""
        }

        <div class="producto-detalle__bloque">
          <h3>Forma de uso</h3>
          <p>${producto.modo_uso}</p>
        </div>

        ${
          necesidadesTexto
            ? `<div class="producto-detalle__bloque">
                <h3>Recomendado para</h3>
                <p>${necesidadesTexto}</p>
              </div>`
            : ""
        }

        <div class="producto-detalle__acciones">
          <div class="selector-cantidad">
            <button id="restar-cantidad" aria-label="Restar">−</button>
            <input id="cantidad" type="text" readonly value="1" aria-label="Cantidad" />
            <button id="sumar-cantidad" aria-label="Sumar">+</button>
          </div>
          <button id="agregar-carrito" class="boton boton--primario" ${producto.stock <= 0 ? "disabled" : ""}>
            ${producto.stock <= 0 ? "Sin stock" : "Agregar al carrito"}
          </button>
          <button id="consultar-whatsapp" class="boton boton--whatsapp">
            Consultar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  `;

  // Miniaturas
  document.querySelectorAll("[data-src]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-src")!;
      (document.getElementById("imagen-principal") as HTMLImageElement).src = src;
      document
        .querySelectorAll("[data-src]")
        .forEach((b) => b.classList.remove("activa"));
      btn.classList.add("activa");
    });
  });

  // Selector de cantidad
  let cantidad = 1;
  const inputCantidad = document.getElementById("cantidad") as HTMLInputElement;
  document.getElementById("restar-cantidad")?.addEventListener("click", () => {
    cantidad = Math.max(1, cantidad - 1);
    inputCantidad.value = String(cantidad);
  });
  document.getElementById("sumar-cantidad")?.addEventListener("click", () => {
    cantidad = Math.min(producto.stock || 1, cantidad + 1);
    inputCantidad.value = String(cantidad);
  });

  document.getElementById("agregar-carrito")?.addEventListener("click", () => {
    carrito.agregar(producto, cantidad);
    document.getElementById("boton-abrir-carrito")?.dispatchEvent(new Event("click"));
  });

  document
    .getElementById("consultar-whatsapp")
    ?.addEventListener("click", () => consultarProductoPorWhatsApp(producto.nombre));
}

iniciar();
