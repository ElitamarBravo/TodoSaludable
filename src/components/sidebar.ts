// Sidebar compartido: se inyecta en todas las páginas públicas y permite
// cambiar entre "Todo Saludable" y las secciones de Kalomai desde un solo enlace.

interface EnlaceSidebar {
  href: string;
  etiqueta: string;
  icono: string;
}

const ENLACES_KALOMAI: EnlaceSidebar[] = [
  { href: "/kalomai-travel.html", etiqueta: "Kalomai Travel", icono: "✈️" },
  { href: "/kalomai-resort.html", etiqueta: "Kalomai Resort", icono: "🏖️" },
  { href: "/kalomai-park.html", etiqueta: "Kalomai Park", icono: "🎡" },
  { href: "/bienes-raices.html", etiqueta: "Bienes y Raíces", icono: "🏞️" },
];

function esRutaActiva(href: string): boolean {
  return window.location.pathname === href;
}

export function inicializarSidebar() {
  if("serviceWorker" in navigator){
    navigator.serviceWorker.addEventListener("controllerchange", ()=>{
      window.location.reload();
    });
  }
  const mount = document.getElementById("sidebar-mount");
  if (!mount) return;

  const enKalomai = ENLACES_KALOMAI.some((e) => esRutaActiva(e.href));
  const enInicio = esRutaActiva("/") || esRutaActiva("/index.html");

  mount.innerHTML = `
    <button id="boton-abrir-sidebar" class="boton-hamburguesa" aria-label="Abrir menú">
      ☰
    </button>
    <div id="sidebar-fondo" class="sidebar__fondo"></div>
    <nav id="barra-sidebar" class="sidebar" aria-label="Navegación principal">
      <div class="sidebar__cierre-movil">
        <button id="boton-cerrar-sidebar" aria-label="Cerrar menú">✕</button>
      </div>

      <a href="/" class="sidebar__enlace-marca ${enInicio ? "activo" : ""}">
        <span class="sidebar__icono">🌿</span>
        <div>
          <span class="sidebar__nombre-marca">Todo Saludable</span>
          <span class="sidebar__submarca">con María Isabel</span>
        </div>
      </a>

      <div class="sidebar__separador"></div>

      <div class="sidebar__grupo-titulo">Kalomai</div>
      <a href="/kalomai.html" class="sidebar__enlace ${esRutaActiva("/kalomai.html") ? "activo" : ""}">
        <span class="sidebar__icono">👑</span>
        <span>Inicio Kalomai</span>
      </a>
      ${ENLACES_KALOMAI.map(
        (e) => `
        <a href="${e.href}" class="sidebar__enlace ${esRutaActiva(e.href) ? "activo" : ""}">
          <span class="sidebar__icono">${e.icono}</span>
          <span>${e.etiqueta}</span>
        </a>`
      ).join("")}

          <div class="sidebar__pie">
        Asesora comercial · Mentora de emprendimiento<br />
        Santa Cruz de la Sierra, Bolivia
        <br />
        <a href="/admin.html" class="sidebar__enlace-admin">🔒 Panel admin</a>
      </div>
    </nav>
  `;

  const barra = document.getElementById("barra-sidebar");
  const fondo = document.getElementById("sidebar-fondo");
  const botonAbrir = document.getElementById("boton-abrir-sidebar");
  const botonCerrar = document.getElementById("boton-cerrar-sidebar");

  const abrir = () => {
    barra?.classList.add("abierto");
    fondo?.classList.add("visible");
  };
  const cerrar = () => {
    barra?.classList.remove("abierto");
    fondo?.classList.remove("visible");
  };

  botonAbrir?.addEventListener("click", abrir);
  botonCerrar?.addEventListener("click", cerrar);
  fondo?.addEventListener("click", cerrar);

  void enKalomai; // reservado por si se agrega resaltado de grupo activo
}
