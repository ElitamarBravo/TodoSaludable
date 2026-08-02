import { consultarDisponibilidadHotel } from "@/lib/whatsapp";

// Inyecta el modal una sola vez en la página y expone abrirModalDisponibilidad()
// para usarlo desde cualquier tarjeta u hospedaje.
let inicializado = false;
let nombreHospedajeActual = "";

export function inicializarModalDisponibilidad() {
  if (inicializado) return;
  inicializado = true;

  const contenedor = document.createElement("div");
  contenedor.innerHTML = `
    <div id="modal-disponibilidad-fondo" class="modal-fondo">
      <div class="modal-caja" role="dialog" aria-label="Consultar disponibilidad">
        <h3 id="modal-disponibilidad-titulo">Consultar disponibilidad</h3>
        <p>Completa estos datos y te contactamos por WhatsApp con la disponibilidad.</p>
        <form id="form-disponibilidad">
          <label for="disp-fecha">Fecha deseada</label>
          <input type="date" id="disp-fecha" required />
          <label for="disp-personas">Cantidad de personas</label>
          <input type="number" id="disp-personas" min="1" value="2" required />
          <label for="disp-dias">Cantidad de días</label>
          <input type="number" id="disp-dias" min="1" value="1" required />
          <div class="modal-caja__acciones">
            <button type="submit" class="boton boton--whatsapp">Enviar por WhatsApp</button>
            <button type="button" id="boton-cerrar-modal-disponibilidad" class="boton boton--secundario">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(contenedor);

  const fondo = document.getElementById("modal-disponibilidad-fondo")!;
  const form = document.getElementById("form-disponibilidad") as HTMLFormElement;

  document
    .getElementById("boton-cerrar-modal-disponibilidad")
    ?.addEventListener("click", () => fondo.classList.remove("visible"));

  fondo.addEventListener("click", (e) => {
    if (e.target === fondo) fondo.classList.remove("visible");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fecha = (document.getElementById("disp-fecha") as HTMLInputElement).value;
    const personas = Number(
      (document.getElementById("disp-personas") as HTMLInputElement).value
    );
    const dias = Number((document.getElementById("disp-dias") as HTMLInputElement).value);

    consultarDisponibilidadHotel(nombreHospedajeActual, { fecha, personas, dias });
    fondo.classList.remove("visible");
    form.reset();
  });
}

export function abrirModalDisponibilidad(nombreHospedaje: string) {
  inicializarModalDisponibilidad();
  nombreHospedajeActual = nombreHospedaje;
  const titulo = document.getElementById("modal-disponibilidad-titulo");
  if (titulo) titulo.textContent = `Consultar disponibilidad · ${nombreHospedaje}`;
  document.getElementById("modal-disponibilidad-fondo")?.classList.add("visible");
}
