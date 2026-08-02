# Todo Saludable con María Isabel

Tienda digital + plataforma de asesoría personalizada. Construida con **HTML, CSS moderno, TypeScript y Supabase** (Database + Storage), lista para publicarse en **Netlify** desde **GitHub** y preparada para convertirse en **PWA instalable** y, más adelante, en app para Google Play (vía Bubblewrap/TWA o Capacitor).

## 1. Estructura del proyecto

```
todo-saludable/
├── index.html          → Página principal (hero, necesidades, catálogo)
├── producto.html        → Ficha de producto individual
├── admin.html            → Panel privado de María Isabel (login + CRUD)
├── src/
│   ├── main.ts            → Lógica de la página principal
│   ├── producto.ts        → Lógica de la ficha de producto
│   ├── admin.ts           → Lógica del panel administrador
│   ├── style.css          → Sistema de diseño (colores, tipografía, componentes)
│   ├── vite-env.d.ts       → Tipos para variables de entorno
│   ├── components/
│   │   └── carritoUI.ts    → Panel de carrito compartido entre páginas
│   └── lib/
│       ├── supabaseClient.ts  → Conexión a Supabase
│       ├── types.ts            → Tipos de datos (Producto, Necesidad, etc.)
│       ├── necesidades.ts      → Catálogo fijo de las 7 necesidades + helpers
│       ├── productos.ts        → Consultas a la tabla "productos"
│       ├── carrito.ts          → Carrito (persistido en localStorage)
│       └── whatsapp.ts         → Generación de mensajes de WhatsApp
├── supabase/
│   └── schema.sql          → Tablas, políticas de seguridad y buckets de Storage
├── .env.example
└── package.json
```

Frontend, base de datos y almacenamiento están separados como pide el proyecto:
- **Frontend** (este repo): diseño, catálogo, búsqueda, filtros, carrito, WhatsApp.
- **Supabase Database**: productos, categorías, necesidades, precios, stock.
- **Supabase Storage**: fotos de María Isabel y fotos de productos (nunca se guardan imágenes dentro del proyecto).

## 2. Configurar Supabase (una sola vez)

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** → pega el contenido completo de `supabase/schema.sql` → **Run**.
   Esto crea:
   - La tabla `productos` (con columnas de necesidades y beneficios como arreglos).
   - La tabla `categorias`.
   - Las políticas de seguridad (RLS): cualquier visitante puede **ver** productos; solo un usuario autenticado (María Isabel) puede **crear, editar o eliminar**.
   - Los buckets públicos de Storage `productos` y `perfil`, con sus políticas.
   - Un producto de ejemplo para que veas el catálogo funcionando de inmediato.
3. Ve a **Authentication → Users → Add user** y crea el usuario de María Isabel (correo + contraseña). Ese será el login del panel `/admin.html`.
4. Ve a **Project Settings → API** y copia:
   - **Project URL**
   - **anon public key**
5. Sube la foto de perfil a **Storage → perfil**, dentro de una carpeta `maria-isabel/`, con el nombre `perfil.jpg` (ruta final: `maria-isabel/perfil.jpg`). Así la portada la carga automáticamente.

## 3. Configurar el proyecto localmente

```bash
npm install
cp .env.example .env
```

Edita `.env` con tus datos:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
VITE_WHATSAPP_NUMBER=59170000000   # número de María Isabel, formato internacional
```

Ejecutar en desarrollo:

```bash
npm run dev
```

Compilar para producción:

```bash
npm run build
```

El resultado queda en `dist/`.

## 4. Cargar productos

**No se escriben productos en el código.** Todo se administra desde `/admin.html`:

1. Inicia sesión con el usuario que creaste en Supabase Authentication.
2. Clic en **"+ Nuevo producto"**.
3. Completa nombre, precio, categoría, stock, presentación, descripción, beneficios (uno por línea) y forma de uso.
4. En **"Necesidades relacionadas"** escribe los ids separados por coma, usando estos valores fijos:

   | Id                         | Nombre visible                        |
   |-----------------------------|----------------------------------------|
   | `bienestar-general`          | 🌿 Bienestar general                   |
   | `huesos-articulaciones`      | 🦴 Huesos, articulaciones y movilidad  |
   | `belleza-piel-vitalidad`     | ✨ Belleza, piel y vitalidad           |
   | `cerebro-memoria-energia`    | 🧠 Cerebro, memoria y energía          |
   | `digestion-interna`          | 🩺 Digestión y bienestar interno       |
   | `vitaminas-fortalecimiento`  | 💪 Vitaminas y fortalecimiento         |
   | `control-corporal`           | ⚖️ Control y bienestar corporal        |

   Ejemplo para Colágeno Hidrolizado: `huesos-articulaciones, belleza-piel-vitalidad, bienestar-general`
5. Sube la imagen frontal (obligatoria) y la posterior (opcional). Se suben directamente a Supabase Storage y la app guarda la URL pública en la base de datos.
6. Guarda. El producto aparece de inmediato en la tienda para todos los visitantes, **sin tocar código ni volver a publicar**.

## 5. Publicar en GitHub + Netlify

1. Sube este proyecto a un repositorio de GitHub.
2. En [Netlify](https://app.netlify.com) → **Add new site → Import an existing project** → conecta el repositorio.
3. Configuración de build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. En **Site settings → Environment variables**, agrega las mismas 3 variables del `.env`:
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP_NUMBER`.
5. Deploy. Cada vez que subas cambios a GitHub, Netlify vuelve a publicar automáticamente — pero agregar productos nuevos **no requiere ningún deploy**, porque viven en Supabase.

## 6. Camino a PWA instalable y Google Play

- La app ya incluye `vite-plugin-pwa`: al compilar genera `manifest.webmanifest` y un service worker, así que en el celular aparecerá la opción **"Instalar app"** / **"Agregar a pantalla de inicio"** sin pasos extra.
- Reemplaza los íconos de ejemplo en `public/icons/` (192px, 512px y 512px maskable) por el logo real del negocio.
- Para publicarla en **Google Play** más adelante, el camino más directo es envolver la PWA como **TWA (Trusted Web Activity)** con [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) o usar [Capacitor](https://capacitorjs.com/) si luego se necesitan funciones nativas (cámara, notificaciones push, etc.). Ninguna de las dos opciones requiere reescribir el frontend.

## 7. Notas de diseño

- Paleta: verde bosque `#2F4A3C`, salvia `#7C9885`, beige `#EDE6D9`, crema `#FAF8F3`, acento miel `#C9A15C`.
- Tipografía: **Fraunces** (encabezados, cálida y con carácter) + **Manrope** (texto, limpia y legible).
- El selector "¿Qué te gustaría mejorar?" usa tarjetas con esquinas asimétricas (forma de hoja) como elemento distintivo de la marca, evitando el look genérico de botones cuadrados.
- Totalmente responsive: probado en columnas para celular, tablet y escritorio (breakpoints en `src/style.css`).

## 8. Kalomai (segundo negocio, mismo sitio)

El proyecto ahora tiene **un solo enlace** con un **sidebar** para cambiar entre tus dos negocios:

```
🌿 Todo Saludable          → index.html (como ya lo conocías)
👑 Kalomai                 → kalomai.html (hub)
   ├── ✈️  Kalomai Travel     → kalomai-travel.html (hoteles)
   ├── 🏖️  Kalomai Resort     → kalomai-resort.html (parte de Travel)
   ├── 🎡 Kalomai Park       → kalomai-park.html (solo galería + membresía)
   └── 🏞️  Bienes y Raíces    → bienes-raices.html (lotes con precio)
```

En `kalomai.html` aparece tu presencia como **María Isabel Torrez, asesora comercial y mentora de emprendimiento** de forma sutil (foto pequeña + una línea), igual que en Todo Saludable pero sin protagonismo.

### Cómo funciona cada sección

- **Kalomai Travel / Resort**: cada hotel tiene botón **"Consultar disponibilidad"**, que abre un formulario (fecha, cantidad de personas, cantidad de días) y arma el mensaje de WhatsApp automáticamente con esos datos.
- **Kalomai Park**: solo galería de fotos + un botón fijo **"Quiero mi membresía Kalomai Park"**. No tiene precios ni carrito.
- **Bienes y Raíces**: funciona como una mini-tienda (como Todo Saludable): catálogo de lotes con foto, precio y ubicación, con su propio carrito ("Lotes de interés") que arma el pedido por WhatsApp con el total.

### Un solo panel de administración

El mismo `/admin.html` que ya usas ahora tiene **pestañas**:

- 🌿 **Productos saludables** (igual que antes)
- ✈️ **Hoteles / Resort**: nombre, tipo (hotel o resort), ubicación, descripción y hasta 4 fotos
- 🏞️ **Lotes**: nombre, precio, ubicación, descripción, fotos y disponibilidad
- 🎡 **Galería Park**: subir fotos sueltas con orden de aparición

Todo con el mismo usuario y contraseña de siempre.

### Base de datos nueva

`supabase/schema.sql` ya incluye las tablas nuevas (`hoteles`, `lotes`, `park_galeria`) y el bucket de Storage `kalomai` para sus fotos. Si ya ejecutaste el SQL antes, solo necesitas correr de nuevo el archivo completo — los `create table if not exists` no van a duplicar lo que ya tienes.
#   T o d o S a l u d a b l e  
 #   T o d o S a l u d a b l e  
 