import type { ConsultaDisponibilidad, ItemCarrito, ItemLote } from "./types";
import { formatearPrecio } from "./necesidades";

const NUMERO_WHATSAPP =
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ??
  "59170000000";

function abrirWhatsApp(mensaje: string) {
  const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(
    mensaje
  )}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function pedirEvaluacionPersonalizada() {
  abrirWhatsApp(
    "Hola María Isabel, quisiera una evaluación personalizada para recibir una recomendación."
  );
}

export function consultarProductoPorWhatsApp(nombreProducto: string) {
  abrirWhatsApp(
    `Hola María Isabel, quisiera más información sobre "${nombreProducto}".`
  );
}

export function enviarPedidoPorWhatsApp(items: ItemCarrito[], total: number) {
  const lineas: string[] = ["Hola María Isabel.", "", "Me interesan estos productos:", ""];

  items.forEach((item) => {
    lineas.push(`Producto:\n${item.producto.nombre}`);
    lineas.push(`Cantidad:\n${item.cantidad}`);
    lineas.push(`Precio:\n${formatearPrecio(item.producto.precio)}`);
    lineas.push(`Presentación:\n${item.producto.presentacion}`);
    lineas.push(`Descripción:\n${item.producto.descripcion}`);
    lineas.push("");
    lineas.push("---");
    lineas.push("");
  });

  lineas.push(`Total:\n${formatearPrecio(total)}`);
  lineas.push("");
  lineas.push("Gracias.");

  abrirWhatsApp(lineas.join("\n"));
}

// -------------------- Kalomai Travel / Resort --------------------
export function consultarDisponibilidadHotel(
  nombreHotel: string,
  datos: ConsultaDisponibilidad
) {
  abrirWhatsApp(
    [
      "Hola María Isabel, quisiera consultar disponibilidad.",
      "",
      `Hospedaje:\n${nombreHotel}`,
      `Fecha deseada:\n${datos.fecha}`,
      `Cantidad de personas:\n${datos.personas}`,
      `Cantidad de días:\n${datos.dias}`,
      "",
      "Quedo atento/a, gracias.",
    ].join("\n")
  );
}

// -------------------- Kalomai Park --------------------
export function solicitarMembresiaPark() {
  abrirWhatsApp(
    "Hola María Isabel, quiero adquirir mi membresía de Kalomai Park. ¿Me ayudas con la información?"
  );
}

// -------------------- Bienes y Raíces (lotes) --------------------
export function consultarLotePorWhatsApp(nombreLote: string) {
  abrirWhatsApp(
    `Hola María Isabel, quisiera más información sobre el lote "${nombreLote}".`
  );
}

export function enviarPedidoLotesPorWhatsApp(items: ItemLote[], total: number) {
  const lineas: string[] = [
    "Hola María Isabel.",
    "",
    "Me interesan estos lotes:",
    "",
  ];

  items.forEach((item) => {
    lineas.push(`Lote:\n${item.lote.nombre}`);
    lineas.push(`Cantidad:\n${item.cantidad}`);
    lineas.push(`Precio:\n${formatearPrecio(item.lote.precio)}`);
    lineas.push(`Ubicación:\n${item.lote.ubicacion}`);
    lineas.push("");
    lineas.push("---");
    lineas.push("");
  });

  lineas.push(`Total:\n${formatearPrecio(total)}`);
  lineas.push("");
  lineas.push("Gracias.");

  abrirWhatsApp(lineas.join("\n"));
}

// -------------------- María Isabel Torrez (mentoría) --------------------
export function contactarAsesoriaEmprendimiento() {
  abrirWhatsApp(
    "Hola María Isabel, me gustaría recibir asesoría sobre emprendimiento."
  );
}
