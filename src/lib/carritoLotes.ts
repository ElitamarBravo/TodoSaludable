import type { ItemLote, Lote } from "./types";

const CLAVE_STORAGE = "kalomai:carrito-lotes";

type Escucha = (items: ItemLote[]) => void;

class CarritoLotes {
  private items: Map<string, ItemLote> = new Map();
  private escuchas: Set<Escucha> = new Set();

  constructor() {
    this.cargar();
  }

  private cargar() {
    try {
      const crudo = localStorage.getItem(CLAVE_STORAGE);
      if (!crudo) return;
      const lista: ItemLote[] = JSON.parse(crudo);
      lista.forEach((item) => this.items.set(item.lote.id, item));
    } catch (e) {
      console.warn("No se pudo leer el carrito de lotes guardado:", e);
    }
  }

  private guardar() {
    localStorage.setItem(
      CLAVE_STORAGE,
      JSON.stringify(Array.from(this.items.values()))
    );
    this.notificar();
  }

  private notificar() {
    const lista = this.obtenerItems();
    this.escuchas.forEach((fn) => fn(lista));
  }

  suscribir(fn: Escucha): () => void {
    this.escuchas.add(fn);
    fn(this.obtenerItems());
    return () => this.escuchas.delete(fn);
  }

  obtenerItems(): ItemLote[] {
    return Array.from(this.items.values());
  }

  agregar(lote: Lote, cantidad = 1) {
    const existente = this.items.get(lote.id);
    this.items.set(lote.id, {
      lote,
      cantidad: (existente?.cantidad ?? 0) + cantidad,
    });
    this.guardar();
  }

  cambiarCantidad(loteId: string, cantidad: number) {
    const existente = this.items.get(loteId);
    if (!existente) return;
    if (cantidad <= 0) {
      this.items.delete(loteId);
    } else {
      existente.cantidad = cantidad;
      this.items.set(loteId, existente);
    }
    this.guardar();
  }

  eliminar(loteId: string) {
    this.items.delete(loteId);
    this.guardar();
  }

  vaciar() {
    this.items.clear();
    this.guardar();
  }

  total(): number {
    return this.obtenerItems().reduce(
      (acum, item) => acum + item.lote.precio * item.cantidad,
      0
    );
  }

  cantidadTotal(): number {
    return this.obtenerItems().reduce((acum, item) => acum + item.cantidad, 0);
  }
}

export const carritoLotes = new CarritoLotes();
