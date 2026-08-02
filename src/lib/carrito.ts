import type { ItemCarrito, Producto } from "./types";

const CLAVE_STORAGE = "todo-saludable:carrito";

type Escucha = (items: ItemCarrito[]) => void;

class Carrito {
  private items: Map<string, ItemCarrito> = new Map();
  private escuchas: Set<Escucha> = new Set();

  constructor() {
    this.cargar();
  }

  private cargar() {
    try {
      const crudo = localStorage.getItem(CLAVE_STORAGE);
      if (!crudo) return;
      const lista: ItemCarrito[] = JSON.parse(crudo);
      lista.forEach((item) => this.items.set(item.producto.id, item));
    } catch (e) {
      console.warn("No se pudo leer el carrito guardado:", e);
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

  obtenerItems(): ItemCarrito[] {
    return Array.from(this.items.values());
  }

  agregar(producto: Producto, cantidad = 1) {
    const existente = this.items.get(producto.id);
    const nuevaCantidad = Math.min(
      (existente?.cantidad ?? 0) + cantidad,
      Math.max(producto.stock, 1)
    );
    this.items.set(producto.id, { producto, cantidad: nuevaCantidad });
    this.guardar();
  }

  cambiarCantidad(productoId: string, cantidad: number) {
    const existente = this.items.get(productoId);
    if (!existente) return;
    if (cantidad <= 0) {
      this.items.delete(productoId);
    } else {
      existente.cantidad = Math.min(cantidad, Math.max(existente.producto.stock, 1));
      this.items.set(productoId, existente);
    }
    this.guardar();
  }

  eliminar(productoId: string) {
    this.items.delete(productoId);
    this.guardar();
  }

  vaciar() {
    this.items.clear();
    this.guardar();
  }

  total(): number {
    return this.obtenerItems().reduce(
      (acum, item) => acum + item.producto.precio * item.cantidad,
      0
    );
  }

  cantidadTotal(): number {
    return this.obtenerItems().reduce((acum, item) => acum + item.cantidad, 0);
  }
}

export const carrito = new Carrito();
