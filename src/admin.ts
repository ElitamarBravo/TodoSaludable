import "@/style.css";
import { supabase, BUCKET_PRODUCTOS, BUCKET_KALOMAI, urlPublicaStorage } from "@/lib/supabaseClient";
import { normalizarProducto, formatearPrecio } from "@/lib/necesidades";
import type { Producto, ProductoRow, HotelRow, LoteRow, FotoPark, NecesidadId } from "@/lib/types";

async function subirArchivo(
  archivo: File,
  bucket: string,
  carpeta: string
): Promise<string> {
  const extension = archivo.name.split(".").pop();
  const nombreArchivo = `${carpeta}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(nombreArchivo, archivo, { upsert: false });
  if (error) throw new Error(`Error al subir imagen: ${error.message}`);
  return urlPublicaStorage(bucket, nombreArchivo);
}

async function subirVariasImagenes(
  archivos: FileList | null,
  bucket: string,
  carpeta: string
): Promise<string[]> {
  if (!archivos || archivos.length === 0) return [];
  const urls: string[] = [];
  for (const archivo of Array.from(archivos)) {
    urls.push(await subirArchivo(archivo, bucket, carpeta));
  }
  return urls;
}
function nombreDeCarpetaSeguro(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes (á → a, ñ → n, etc.)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // cualquier otro símbolo se vuelve guion
    .replace(/^-+|-+$/g, "") || "general";
}
// -------------------- Pestañas --------------------
document.querySelectorAll<HTMLButtonElement>(".admin-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("activa"));
    document.querySelectorAll<HTMLElement>(".admin-panel-tab").forEach((p) => (p.style.display = "none"));
    tab.classList.add("activa");
    const destino = document.getElementById(`panel-tab-${tab.dataset.tab}`);
    if (destino) destino.style.display = "block";

    if (tab.dataset.tab === "hoteles") cargarHoteles();
    if (tab.dataset.tab === "lotes") cargarLotes();
    if (tab.dataset.tab === "park") cargarFotosPark();
  });
});

const vistaLogin = document.getElementById("vista-login")!;
const vistaAdmin = document.getElementById("vista-admin")!;
const botonCerrarSesion = document.getElementById("boton-cerrar-sesion")!;

// -------------------- Autenticación --------------------
const formLogin = document.getElementById("form-login") as HTMLFormElement;
const loginError = document.getElementById("login-error")!;

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";
  const email = (document.getElementById("login-email") as HTMLInputElement).value;
  const password = (document.getElementById("login-password") as HTMLInputElement)
    .value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    loginError.textContent = "Correo o contraseña incorrectos.";
    return;
  }
  mostrarPanelAdmin();
});

botonCerrarSesion.addEventListener("click", async () => {
  await supabase.auth.signOut();
  vistaAdmin.style.display = "none";
  botonCerrarSesion.style.display = "none";
  vistaLogin.style.display = "block";
});

async function verificarSesion() {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    mostrarPanelAdmin();
  }
}

function mostrarPanelAdmin() {
  vistaLogin.style.display = "none";
  vistaAdmin.style.display = "block";
  botonCerrarSesion.style.display = "inline-flex";
  cargarProductos();
}

verificarSesion();

// -------------------- Formulario producto --------------------
const formProducto = document.getElementById("form-producto") as HTMLFormElement;
const botonNuevo = document.getElementById("boton-nuevo-producto")!;
const botonCancelar = document.getElementById("boton-cancelar-form")!;
const formError = document.getElementById("form-error")!;

const campos = {
  id: document.getElementById("producto-id") as HTMLInputElement,
  nombre: document.getElementById("campo-nombre") as HTMLInputElement,
  precio: document.getElementById("campo-precio") as HTMLInputElement,
  stock: document.getElementById("campo-stock") as HTMLInputElement,
  categoria: document.getElementById("campo-categoria") as HTMLInputElement,
  presentacion: document.getElementById("campo-presentacion") as HTMLInputElement,
  tamano: document.getElementById("campo-tamano") as HTMLInputElement,
  // "necesidades" se lee directo de las casillas marcadas (.check-necesidad), no de un input de texto
  descripcion: document.getElementById("campo-descripcion") as HTMLTextAreaElement,
  beneficios: document.getElementById("campo-beneficios") as HTMLTextAreaElement,
  modoUso: document.getElementById("campo-modo-uso") as HTMLTextAreaElement,
  imagenFrontal: document.getElementById("campo-imagen-frontal") as HTMLInputElement,
  imagenPosterior: document.getElementById("campo-imagen-posterior") as HTMLInputElement,
  activo: document.getElementById("campo-activo") as HTMLSelectElement,
};

let urlFrontalExistente = "";
let urlPosteriorExistente = "";

botonNuevo.addEventListener("click", () => {
  formProducto.reset();
  document.querySelectorAll<HTMLInputElement>(".check-necesidad").forEach((c) => (c.checked = false));
  campos.id.value = "";
  urlFrontalExistente = "";
  urlPosteriorExistente = "";
  formError.textContent = "";
  formProducto.style.display = "grid";
});

botonCancelar.addEventListener("click", () => {
  formProducto.style.display = "none";
});

async function subirImagen(archivo: File, carpeta: string): Promise<string> {
  const extension = archivo.name.split(".").pop();
  const nombreArchivo = `${carpeta}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(BUCKET_PRODUCTOS)
    .upload(nombreArchivo, archivo, { upsert: false });

  if (error) throw new Error(`Error al subir imagen: ${error.message}`);
  return urlPublicaStorage(BUCKET_PRODUCTOS, nombreArchivo);
}

formProducto.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.textContent = "";

  const botonGuardar = formProducto.querySelector(
    'button[type="submit"]'
  ) as HTMLButtonElement;
  botonGuardar.disabled = true;
  botonGuardar.textContent = "Guardando...";

  try {
const carpeta = nombreDeCarpetaSeguro(campos.categoria.value);
    let imagenFrontalUrl = urlFrontalExistente;
    if (campos.imagenFrontal.files?.[0]) {
      imagenFrontalUrl = await subirImagen(campos.imagenFrontal.files[0], carpeta);
    }

    let imagenPosteriorUrl = urlPosteriorExistente;
    if (campos.imagenPosterior.files?.[0]) {
      imagenPosteriorUrl = await subirImagen(campos.imagenPosterior.files[0], carpeta);
    }

    if (!imagenFrontalUrl) {
      throw new Error("La imagen frontal es obligatoria.");
    }

    const necesidades = Array.from(
      document.querySelectorAll<HTMLInputElement>(".check-necesidad:checked")
    ).map((c) => c.value);

    const beneficios = campos.beneficios.value
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);

    const payload = {
      nombre: campos.nombre.value.trim(),
      descripcion: campos.descripcion.value.trim(),
      precio: Number(campos.precio.value),
      categoria: campos.categoria.value.trim(),
      necesidades,
      presentacion: campos.presentacion.value.trim(),
      tamano: campos.tamano.value.trim(),
      beneficios,
      modo_uso: campos.modoUso.value.trim(),
      stock: Number(campos.stock.value),
      imagen_frontal_url: imagenFrontalUrl,
      imagen_posterior_url: imagenPosteriorUrl || null,
      activo: campos.activo.value === "true",
    };

    if (campos.id.value) {
      const { error } = await supabase
        .from("productos")
        .update(payload)
        .eq("id", campos.id.value);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("productos").insert(payload);
      if (error) throw new Error(error.message);
    }

    formProducto.style.display = "none";
    formProducto.reset();
    await cargarProductos();
  } catch (err) {
    formError.textContent = err instanceof Error ? err.message : "Error desconocido.";
  } finally {
    botonGuardar.disabled = false;
    botonGuardar.textContent = "Guardar producto";
  }
});

// -------------------- Tabla de productos --------------------
const cuerpoTabla = document.getElementById("cuerpo-tabla-productos")!;

async function cargarProductos() {
  cuerpoTabla.innerHTML = `<tr><td colspan="7">Cargando...</td></tr>`;
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("fecha_creacion", { ascending: false });

  if (error) {
    cuerpoTabla.innerHTML = `<tr><td colspan="7">Error al cargar: ${error.message}</td></tr>`;
    return;
  }

  const productos = (data as ProductoRow[]).map(normalizarProducto);

  if (productos.length === 0) {
    cuerpoTabla.innerHTML = `<tr><td colspan="7">Aún no hay productos. Crea el primero con "Nuevo producto".</td></tr>`;
    return;
  }

  cuerpoTabla.innerHTML = "";
  productos.forEach((p) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><img src="${p.imagen_frontal_url}" alt="${p.nombre}" /></td>
      <td>${p.nombre}</td>
      <td>${p.categoria}</td>
      <td>${formatearPrecio(p.precio)}</td>
      <td>${p.stock}</td>
      <td>${p.activo ? "Visible" : "Oculto"}</td>
      <td>
        <div class="admin-acciones-fila">
          <button data-accion="editar">Editar</button>
          <button data-accion="eliminar">Eliminar</button>
        </div>
      </td>
    `;

    fila
      .querySelector('[data-accion="editar"]')
      ?.addEventListener("click", () => editarProducto(p));
    fila
      .querySelector('[data-accion="eliminar"]')
      ?.addEventListener("click", () => eliminarProducto(p));

    cuerpoTabla.appendChild(fila);
  });
}

function editarProducto(p: Producto) {
  campos.id.value = p.id;
  campos.nombre.value = p.nombre;
  campos.precio.value = String(p.precio);
  campos.stock.value = String(p.stock);
  campos.categoria.value = p.categoria;
  campos.presentacion.value = p.presentacion;
  campos.tamano.value = p.tamano;
  document.querySelectorAll<HTMLInputElement>(".check-necesidad").forEach((c) => {
    c.checked = p.necesidades.includes(c.value as NecesidadId);
  });
  campos.descripcion.value = p.descripcion;
  campos.beneficios.value = p.beneficios.join("\n");
  campos.modoUso.value = p.modo_uso;
  campos.activo.value = String(p.activo);
  urlFrontalExistente = p.imagen_frontal_url;
  urlPosteriorExistente = p.imagen_posterior_url ?? "";
  formError.textContent = "";
  formProducto.style.display = "grid";
  formProducto.scrollIntoView({ behavior: "smooth" });
}

async function eliminarProducto(p: Producto) {
  const confirmado = window.confirm(
    `¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`
  );
  if (!confirmado) return;

  const { error } = await supabase.from("productos").delete().eq("id", p.id);
  if (error) {
    window.alert(`Error al eliminar: ${error.message}`);
    return;
  }
  await cargarProductos();
}

// ============================================================
// Hoteles / Resort (Kalomai Travel)
// ============================================================
const formHotel = document.getElementById("form-hotel") as HTMLFormElement;
const botonNuevoHotel = document.getElementById("boton-nuevo-hotel")!;
const cuerpoTablaHoteles = document.getElementById("cuerpo-tabla-hoteles")!;

const camposHotel = {
  id: document.getElementById("hotel-id") as HTMLInputElement,
  nombre: document.getElementById("hotel-nombre") as HTMLInputElement,
  tipo: document.getElementById("hotel-tipo") as HTMLSelectElement,
  ubicacion: document.getElementById("hotel-ubicacion") as HTMLInputElement,
  descripcion: document.getElementById("hotel-descripcion") as HTMLTextAreaElement,
  fotos: document.getElementById("hotel-fotos") as HTMLInputElement,
  activo: document.getElementById("hotel-activo") as HTMLSelectElement,
};

let fotosHotelExistentes: string[] = [];

botonNuevoHotel.addEventListener("click", () => {
  formHotel.reset();
  camposHotel.id.value = "";
  fotosHotelExistentes = [];
  document.getElementById("form-hotel-error")!.textContent = "";
  formHotel.style.display = "grid";
});

document.getElementById("boton-cancelar-form-hotel")?.addEventListener("click", () => {
  formHotel.style.display = "none";
});

formHotel.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("form-hotel-error")!;
  errorEl.textContent = "";
  const boton = formHotel.querySelector('button[type="submit"]') as HTMLButtonElement;
  boton.disabled = true;
  boton.textContent = "Guardando...";

  try {
    const carpeta = camposHotel.tipo.value;
    const nuevasFotos = await subirVariasImagenes(
      camposHotel.fotos.files,
      BUCKET_KALOMAI,
      `hoteles/${carpeta}`
    );
    const fotos = [...fotosHotelExistentes, ...nuevasFotos];

    if (fotos.length === 0) throw new Error("Sube al menos una foto.");

    const payload = {
      nombre: camposHotel.nombre.value.trim(),
      tipo: camposHotel.tipo.value,
      ubicacion: camposHotel.ubicacion.value.trim(),
      descripcion: camposHotel.descripcion.value.trim(),
      fotos,
      activo: camposHotel.activo.value === "true",
    };

    if (camposHotel.id.value) {
      const { error } = await supabase.from("hoteles").update(payload).eq("id", camposHotel.id.value);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("hoteles").insert(payload);
      if (error) throw new Error(error.message);
    }

    formHotel.style.display = "none";
    formHotel.reset();
    await cargarHoteles();
  } catch (err) {
    errorEl.textContent = err instanceof Error ? err.message : "Error desconocido.";
  } finally {
    boton.disabled = false;
    boton.textContent = "Guardar hospedaje";
  }
});

async function cargarHoteles() {
  cuerpoTablaHoteles.innerHTML = `<tr><td colspan="6">Cargando...</td></tr>`;
  const { data, error } = await supabase
    .from("hoteles")
    .select("*")
    .order("fecha_creacion", { ascending: false });

  if (error) {
    cuerpoTablaHoteles.innerHTML = `<tr><td colspan="6">Error: ${error.message}</td></tr>`;
    return;
  }

  const hoteles = data as HotelRow[];
  if (hoteles.length === 0) {
    cuerpoTablaHoteles.innerHTML = `<tr><td colspan="6">Aún no hay hospedajes cargados.</td></tr>`;
    return;
  }

  cuerpoTablaHoteles.innerHTML = "";
  hoteles.forEach((h) => {
    const fotos = Array.isArray(h.fotos) ? h.fotos : [];
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><img src="${fotos[0] ?? ""}" alt="${h.nombre}" /></td>
      <td>${h.nombre}</td>
      <td>${h.tipo === "resort" ? "Resort" : "Travel (hotel)"}</td>
      <td>${h.ubicacion}</td>
      <td>${h.activo ? "Visible" : "Oculto"}</td>
      <td>
        <div class="admin-acciones-fila">
          <button data-accion="editar">Editar</button>
          <button data-accion="eliminar">Eliminar</button>
        </div>
      </td>
    `;
    fila.querySelector('[data-accion="editar"]')?.addEventListener("click", () => {
      camposHotel.id.value = h.id;
      camposHotel.nombre.value = h.nombre;
      camposHotel.tipo.value = h.tipo;
      camposHotel.ubicacion.value = h.ubicacion;
      camposHotel.descripcion.value = h.descripcion;
      camposHotel.activo.value = String(h.activo);
      fotosHotelExistentes = fotos;
      document.getElementById("form-hotel-error")!.textContent = "";
      formHotel.style.display = "grid";
      formHotel.scrollIntoView({ behavior: "smooth" });
    });
    fila.querySelector('[data-accion="eliminar"]')?.addEventListener("click", async () => {
      if (!window.confirm(`¿Eliminar "${h.nombre}"?`)) return;
      const { error } = await supabase.from("hoteles").delete().eq("id", h.id);
      if (error) window.alert(`Error al eliminar: ${error.message}`);
      else await cargarHoteles();
    });
    cuerpoTablaHoteles.appendChild(fila);
  });
}

// ============================================================
// Lotes (Bienes y Raíces)
// ============================================================
const formLote = document.getElementById("form-lote") as HTMLFormElement;
const botonNuevoLote = document.getElementById("boton-nuevo-lote")!;
const cuerpoTablaLotes = document.getElementById("cuerpo-tabla-lotes")!;

const camposLote = {
  id: document.getElementById("lote-id") as HTMLInputElement,
  nombre: document.getElementById("lote-nombre") as HTMLInputElement,
  precio: document.getElementById("lote-precio") as HTMLInputElement,
  ubicacion: document.getElementById("lote-ubicacion") as HTMLInputElement,
  descripcion: document.getElementById("lote-descripcion") as HTMLTextAreaElement,
  fotos: document.getElementById("lote-fotos") as HTMLInputElement,
  disponible: document.getElementById("lote-disponible") as HTMLSelectElement,
  activo: document.getElementById("lote-activo") as HTMLSelectElement,
};

let fotosLoteExistentes: string[] = [];

botonNuevoLote.addEventListener("click", () => {
  formLote.reset();
  camposLote.id.value = "";
  fotosLoteExistentes = [];
  document.getElementById("form-lote-error")!.textContent = "";
  formLote.style.display = "grid";
});

document.getElementById("boton-cancelar-form-lote")?.addEventListener("click", () => {
  formLote.style.display = "none";
});

formLote.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("form-lote-error")!;
  errorEl.textContent = "";
  const boton = formLote.querySelector('button[type="submit"]') as HTMLButtonElement;
  boton.disabled = true;
  boton.textContent = "Guardando...";

  try {
    const nuevasFotos = await subirVariasImagenes(camposLote.fotos.files, BUCKET_KALOMAI, "lotes");
    const fotos = [...fotosLoteExistentes, ...nuevasFotos];
    if (fotos.length === 0) throw new Error("Sube al menos una foto.");

    const payload = {
      nombre: camposLote.nombre.value.trim(),
      precio: Number(camposLote.precio.value),
      ubicacion: camposLote.ubicacion.value.trim(),
      descripcion: camposLote.descripcion.value.trim(),
      fotos,
      disponible: camposLote.disponible.value === "true",
      activo: camposLote.activo.value === "true",
    };

    if (camposLote.id.value) {
      const { error } = await supabase.from("lotes").update(payload).eq("id", camposLote.id.value);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("lotes").insert(payload);
      if (error) throw new Error(error.message);
    }

    formLote.style.display = "none";
    formLote.reset();
    await cargarLotes();
  } catch (err) {
    errorEl.textContent = err instanceof Error ? err.message : "Error desconocido.";
  } finally {
    boton.disabled = false;
    boton.textContent = "Guardar lote";
  }
});

async function cargarLotes() {
  cuerpoTablaLotes.innerHTML = `<tr><td colspan="6">Cargando...</td></tr>`;
  const { data, error } = await supabase
    .from("lotes")
    .select("*")
    .order("fecha_creacion", { ascending: false });

  if (error) {
    cuerpoTablaLotes.innerHTML = `<tr><td colspan="6">Error: ${error.message}</td></tr>`;
    return;
  }

  const lotes = data as LoteRow[];
  if (lotes.length === 0) {
    cuerpoTablaLotes.innerHTML = `<tr><td colspan="6">Aún no hay lotes cargados.</td></tr>`;
    return;
  }

  cuerpoTablaLotes.innerHTML = "";
  lotes.forEach((l) => {
    const fotos = Array.isArray(l.fotos) ? l.fotos : [];
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><img src="${fotos[0] ?? ""}" alt="${l.nombre}" /></td>
      <td>${l.nombre}</td>
      <td>${formatearPrecio(l.precio)}</td>
      <td>${l.ubicacion}</td>
      <td>${l.disponible ? "Sí" : "No"}</td>
      <td>
        <div class="admin-acciones-fila">
          <button data-accion="editar">Editar</button>
          <button data-accion="eliminar">Eliminar</button>
        </div>
      </td>
    `;
    fila.querySelector('[data-accion="editar"]')?.addEventListener("click", () => {
      camposLote.id.value = l.id;
      camposLote.nombre.value = l.nombre;
      camposLote.precio.value = String(l.precio);
      camposLote.ubicacion.value = l.ubicacion;
      camposLote.descripcion.value = l.descripcion;
      camposLote.disponible.value = String(l.disponible);
      camposLote.activo.value = String(l.activo);
      fotosLoteExistentes = fotos;
      document.getElementById("form-lote-error")!.textContent = "";
      formLote.style.display = "grid";
      formLote.scrollIntoView({ behavior: "smooth" });
    });
    fila.querySelector('[data-accion="eliminar"]')?.addEventListener("click", async () => {
      if (!window.confirm(`¿Eliminar "${l.nombre}"?`)) return;
      const { error } = await supabase.from("lotes").delete().eq("id", l.id);
      if (error) window.alert(`Error al eliminar: ${error.message}`);
      else await cargarLotes();
    });
    cuerpoTablaLotes.appendChild(fila);
  });
}

// ============================================================
// Galería de Kalomai Park
// ============================================================
const formPark = document.getElementById("form-foto-park") as HTMLFormElement;
const botonNuevaFotoPark = document.getElementById("boton-nueva-foto-park")!;
const cuerpoTablaPark = document.getElementById("cuerpo-tabla-park")!;

const camposPark = {
  id: document.getElementById("park-id") as HTMLInputElement,
  imagen: document.getElementById("park-imagen") as HTMLInputElement,
  orden: document.getElementById("park-orden") as HTMLInputElement,
  descripcion: document.getElementById("park-descripcion") as HTMLInputElement,
};

let imagenParkExistente = "";

botonNuevaFotoPark.addEventListener("click", () => {
  formPark.reset();
  camposPark.id.value = "";
  imagenParkExistente = "";
  document.getElementById("form-park-error")!.textContent = "";
  formPark.style.display = "grid";
});

document.getElementById("boton-cancelar-form-park")?.addEventListener("click", () => {
  formPark.style.display = "none";
});

formPark.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("form-park-error")!;
  errorEl.textContent = "";
  const boton = formPark.querySelector('button[type="submit"]') as HTMLButtonElement;
  boton.disabled = true;
  boton.textContent = "Guardando...";

  try {
    let imagenUrl = imagenParkExistente;
    if (camposPark.imagen.files?.[0]) {
      imagenUrl = await subirArchivo(camposPark.imagen.files[0], BUCKET_KALOMAI, "park");
    }
    if (!imagenUrl) throw new Error("Sube una foto.");

    const payload = {
      imagen_url: imagenUrl,
      orden: Number(camposPark.orden.value) || 1,
      descripcion: camposPark.descripcion.value.trim(),
      activo: true,
    };

    if (camposPark.id.value) {
      const { error } = await supabase.from("park_galeria").update(payload).eq("id", camposPark.id.value);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("park_galeria").insert(payload);
      if (error) throw new Error(error.message);
    }

    formPark.style.display = "none";
    formPark.reset();
    await cargarFotosPark();
  } catch (err) {
    errorEl.textContent = err instanceof Error ? err.message : "Error desconocido.";
  } finally {
    boton.disabled = false;
    boton.textContent = "Guardar foto";
  }
});

async function cargarFotosPark() {
  cuerpoTablaPark.innerHTML = `<tr><td colspan="4">Cargando...</td></tr>`;
  const { data, error } = await supabase.from("park_galeria").select("*").order("orden", { ascending: true });

  if (error) {
    cuerpoTablaPark.innerHTML = `<tr><td colspan="4">Error: ${error.message}</td></tr>`;
    return;
  }

  const fotos = data as FotoPark[];
  if (fotos.length === 0) {
    cuerpoTablaPark.innerHTML = `<tr><td colspan="4">Aún no hay fotos cargadas.</td></tr>`;
    return;
  }

  cuerpoTablaPark.innerHTML = "";
  fotos.forEach((f) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><img src="${f.imagen_url}" alt="${f.descripcion}" /></td>
      <td>${f.descripcion || "—"}</td>
      <td>${f.orden}</td>
      <td>
        <div class="admin-acciones-fila">
          <button data-accion="editar">Editar</button>
          <button data-accion="eliminar">Eliminar</button>
        </div>
      </td>
    `;
    fila.querySelector('[data-accion="editar"]')?.addEventListener("click", () => {
      camposPark.id.value = f.id;
      camposPark.orden.value = String(f.orden);
      camposPark.descripcion.value = f.descripcion;
      imagenParkExistente = f.imagen_url;
      document.getElementById("form-park-error")!.textContent = "";
      formPark.style.display = "grid";
      formPark.scrollIntoView({ behavior: "smooth" });
    });
    fila.querySelector('[data-accion="eliminar"]')?.addEventListener("click", async () => {
      if (!window.confirm("¿Eliminar esta foto?")) return;
      const { error } = await supabase.from("park_galeria").delete().eq("id", f.id);
      if (error) window.alert(`Error al eliminar: ${error.message}`);
      else await cargarFotosPark();
    });
    cuerpoTablaPark.appendChild(fila);
  });
}