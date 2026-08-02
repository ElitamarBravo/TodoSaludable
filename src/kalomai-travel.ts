import "@/style.css";
import { inicializarSidebar } from "@/components/sidebar";
import { renderizarListaHospedajes } from "@/components/listaHospedajes";

inicializarSidebar();
renderizarListaHospedajes("hotel", "grid-hoteles");
