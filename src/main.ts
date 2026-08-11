import "@/style.css";
import { inicializarSidebar } from "@/components/sidebar";
import { supabaseConfigurado, urlPublicaStorage, BUCKET_PERFIL } from "@/lib/supabaseClient";
import { NECESIDADES } from "@/lib/necesidades";
import { obtenerTodosLosProductos, obtenerProductosPorNecesidad, buscarProductos } from "@/lib/productos";
import { carrito } from "@/lib/carrito";
import { pedirEvaluacionPersonalizada } from "@/lib/whatsapp";
import { inicializarCarritoUI } from "@/components/carritoUI";
import type { NecesidadId, Producto } from "@/lib/types";

inicializarSidebar();

document.getElementById("anio-actual")!.textContent = String(
  new Date().getFullYear()
);

if (!supabaseConfigurado) {
  const aviso = document.getElementById("aviso-configuracion");
  if (aviso) {
    aviso.className = "aviso-configuracion";
    aviso.textContent =
      "⚠️ Este sitio aún no está conectado a Supabase. Copia .env.example a .env y completa tus credenciales para ver los productos reales.";
  }
}

// Foto de portada de María Isabel desde Supabase Storage
const fotoPerfil = document.getElementById(
  "foto-maria-isabel"
) as HTMLImageElement | null;
if (fotoPerfil) {
  fotoPerfil.src = urlPublicaStorage(BUCKET_PERFIL, "maria-isabel/perfil.jpg");
  fotoPerfil.onerror = () => {
    fotoPerfil.src =
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500'><rect width='100%' height='100%' fill='#a9c2ae'/><text x='50%' y='50%' font-family='sans-serif' font-size='20' fill='#2F4A3C' text-anchor='middle'>Foto de María Isabel</text></svg>`
      );
  };
}

inicializarCarritoUI();

document
  .getElementById("boton-evaluacion")
  ?.addEventListener("click", pedirEvaluacionPersonalizada);
document
  .getElementById("boton-hero-evaluacion")
  ?.addEventListener("click", pedirEvaluacionPersonalizada);

// -------------------- Rueda de necesidades --------------------
const ruedaEl = document.getElementById("rueda-necesidades")!;
NECESIDADES.forEach((n) => {
  const btn = document.createElement("button");
  btn.className = "necesidad-hoja";
  btn.type = "button";
  btn.innerHTML = `
    <span class="necesidad-hoja__icono">${n.icono}</span>
    <span class="necesidad-hoja__nombre">${n.nombre}</span>
    <span class="necesidad-hoja__desc">${n.descripcion}</span>
  `;
  btn.addEventListener("click", () => filtrarPorNecesidad(n.id));
  ruedaEl.appendChild(btn);
});

// -------------------- Catálogo --------------------
const gridEl = document.getElementById("grid-productos")!;
const barraFiltros = document.getElementById("barra-filtros")!;
const tituloCatalogo = document.getElementById("titulo-catalogo")!;
const subtituloCatalogo = document.getElementById("subtitulo-catalogo")!;
const inputBusqueda = document.getElementById(
  "input-busqueda-header"
) as HTMLInputElement | null;

let todosLosProductos: Producto[] = [];
let categoriaActiva: string | null = null;

function categoriasUnicas(): string[] {
  const set = new Set(
    todosLosProductos.map((p) => p.categoria).filter((c) => c && c.trim())
  );
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
}

function renderChipsCategoria() {
  barraFiltros.innerHTML = "";
  const chipTodos = document.createElement("button");
  chipTodos.className = `chip-filtro ${categoriaActiva === null ? "activo" : ""}`;
  chipTodos.textContent = "Todos";
  chipTodos.addEventListener("click", () => filtrarPorCategoria(null));
  barraFiltros.appendChild(chipTodos);

  categoriasUnicas().forEach((categoria) => {
    const chip = document.createElement("button");
    chip.className = `chip-filtro ${categoriaActiva === categoria ? "activo" : ""}`;
    chip.textContent = categoria;
    chip.addEventListener("click", () => filtrarPorCategoria(categoria));
    barraFiltros.appendChild(chip);
  });
}

function filtrarPorCategoria(categoria: string | null) {
  categoriaActiva = categoria;
  renderChipsCategoria();
  if (inputBusqueda) inputBusqueda.value = "";

  if (categoria === null) {
    tituloCatalogo.textContent = "Nuestros productos";
    subtituloCatalogo.textContent = "Explora todo el catálogo o filtra por categoría.";
    renderProductos(todosLosProductos);
    return;
  }

  tituloCatalogo.textContent = categoria;
  subtituloCatalogo.textContent = `Productos de la categoría "${categoria}".`;
  renderProductos(todosLosProductos.filter((p) => p.categoria === categoria));
}

function renderProductos(productos: Producto[]) {
  gridEl.innerHTML = "";

  if (productos.length === 0) {
    gridEl.innerHTML = `<p class="estado-vacio">No encontramos productos para esta búsqueda todavía. Escríbele a María Isabel y te ayuda a encontrar la opción ideal.</p>`;
    return;
  }

  productos.forEach((p) => {
    const tarjeta = document.createElement("a");
    tarjeta.className = "tarjeta-producto";
     tarjeta.href = `/producto.html?id=${p.id}`;
    const sinStock = p.stock <= 0;
    tarjeta.innerHTML = `
      <div class="tarjeta-producto__imagen">
        <img src="${p.imagen_frontal_url}" alt="${p.nombre}" loading="lazy" />
      </div>
      <div class="tarjeta-producto__cuerpo">
        <span class="tarjeta-producto__categoria">${p.categoria}</span>
        <h3 class="tarjeta-producto__nombre">${p.nombre}</h3>
              <span class="tarjeta-producto__stock ${sinStock ? "agotado" : ""}">
          ${sinStock ? "Agotado" : `Disponible · ${p.presentacion}`}
        </span>
        <span class="tarjeta-producto__vermas">Ver detalles →</span>
      </div>
    `;
    gridEl.appendChild(tarjeta);
  });
}

async function filtrarPorNecesidad(necesidad: NecesidadId | null) {
  categoriaActiva = null;
  renderChipsCategoria();

  if (inputBusqueda) inputBusqueda.value = "";

  if (necesidad === null) {
    tituloCatalogo.textContent = "Nuestros productos";
    subtituloCatalogo.textContent =
      "Explora todo el catálogo o filtra por lo que buscas mejorar.";
    renderProductos(todosLosProductos);
    return;
  }

  const info = NECESIDADES.find((n) => n.id === necesidad);
  tituloCatalogo.textContent = `${info?.icono ?? ""} ${info?.nombre ?? ""}`;
  subtituloCatalogo.textContent =
    info?.descripcion ?? "Productos relacionados con esta necesidad.";

  gridEl.innerHTML = `<div class="spinner"></div>`;
  const productos = await obtenerProductosPorNecesidad(necesidad);
  renderProductos(productos);

  document
    .getElementById("catalogo")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

inputBusqueda?.addEventListener("input", () => {
  categoriaActiva = null;
  renderChipsCategoria();
  const resultado = buscarProductos(todosLosProductos, inputBusqueda.value);
  tituloCatalogo.textContent = inputBusqueda.value
    ? `Resultados para "${inputBusqueda.value}"`
    : "Nuestros productos";
  subtituloCatalogo.textContent = inputBusqueda.value
    ? `${resultado.length} producto(s) encontrado(s).`
    : "Explora todo el catálogo o filtra por categoría.";
  renderProductos(resultado);

  if (inputBusqueda.value.trim().length > 0 ) {
    document
      .getElementById("catalogo")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

async function iniciar() {
  gridEl.innerHTML = `<div class="spinner"></div>`;
  todosLosProductos = await obtenerTodosLosProductos();
  renderChipsCategoria();
  renderProductos(todosLosProductos);
}

iniciar();

// Mantiene sincronizado el contador aunque el carrito cambie en otra pestaña
window.addEventListener("storage", () => {
  const contador = document.getElementById("contador-carrito");
  if (contador) contador.textContent = String(carrito.cantidadTotal());
});
