-- ============================================================
-- Todo Saludable con María Isabel — esquema de Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Extensión para generar UUIDs
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------
-- Tabla: categorias
-- ---------------------------------------------------------------
create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique
);

insert into categorias (nombre) values
  ('Bienestar general'),
  ('Huesos, articulaciones y movilidad'),
  ('Belleza, piel y vitalidad'),
  ('Cerebro, memoria y energía'),
  ('Digestión y bienestar interno'),
  ('Vitaminas y fortalecimiento'),
  ('Control y bienestar corporal')
on conflict (nombre) do nothing;

-- ---------------------------------------------------------------
-- Tabla: productos
-- ---------------------------------------------------------------
create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text not null default '',
  precio numeric(10, 2) not null default 0 check (precio >= 0),
  categoria text not null,
  -- ids de necesidades, ej: {'huesos-articulaciones','belleza-piel-vitalidad'}
  necesidades text[] not null default '{}',
  presentacion text not null default '',
  tamano text not null default '',
  beneficios text[] not null default '{}',
  modo_uso text not null default '',
  stock integer not null default 0 check (stock >= 0),
  imagen_frontal_url text not null,
  imagen_posterior_url text,
  activo boolean not null default true,
  fecha_creacion timestamptz not null default now()
);

-- Índices para búsqueda y filtrado rápido
create index if not exists idx_productos_necesidades on productos using gin (necesidades);
create index if not exists idx_productos_categoria on productos (categoria);
create index if not exists idx_productos_activo on productos (activo);
create index if not exists idx_productos_nombre_trgm on productos using gin (nombre gin_trgm_ops);

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------
-- Seguridad a nivel de fila (RLS)
-- ---------------------------------------------------------------
alter table productos enable row level security;
alter table categorias enable row level security;

-- Cualquier visitante (clave "anon") puede LEER productos activos
create policy "Lectura pública de productos activos"
  on productos for select
  using (true);

-- Solo usuarios autenticados (María Isabel en el panel admin) pueden
-- crear, editar o eliminar productos.
create policy "Administradores pueden insertar productos"
  on productos for insert
  to authenticated
  with check (true);

create policy "Administradores pueden editar productos"
  on productos for update
  to authenticated
  using (true)
  with check (true);

create policy "Administradores pueden eliminar productos"
  on productos for delete
  to authenticated
  using (true);

create policy "Lectura pública de categorías"
  on categorias for select
  using (true);

create policy "Administradores pueden gestionar categorías"
  on categorias for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================
-- Storage: buckets para fotos de productos y foto de perfil
-- Ejecutar también desde el SQL editor, o crear los buckets
-- manualmente en Supabase > Storage con estos mismos nombres.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('perfil', 'perfil', true)
on conflict (id) do nothing;

-- Lectura pública de ambos buckets (necesario para que el catálogo
-- muestre las imágenes a cualquier visitante sin iniciar sesión)
create policy "Lectura pública bucket productos"
  on storage.objects for select
  using (bucket_id = 'productos');

create policy "Lectura pública bucket perfil"
  on storage.objects for select
  using (bucket_id = 'perfil');

-- Solo administradores autenticados pueden subir o modificar archivos
create policy "Administradores suben a productos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'productos');

create policy "Administradores actualizan productos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'productos');

create policy "Administradores eliminan de productos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'productos');

create policy "Administradores suben a perfil"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'perfil');

create policy "Administradores actualizan perfil"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'perfil');

-- ============================================================
-- Datos de ejemplo (opcional) — puedes borrar este bloque si
-- prefieres cargar tus propios productos desde el panel admin.
-- ============================================================
insert into productos (
  nombre, descripcion, precio, categoria, necesidades,
  presentacion, tamano, beneficios, modo_uso, stock,
  imagen_frontal_url, activo
) values (
  'Colágeno Hidrolizado',
  'Colágeno hidrolizado de alta absorción para apoyar articulaciones, piel y bienestar general.',
  120.00,
  'Colágenos',
  array['huesos-articulaciones','belleza-piel-vitalidad','bienestar-general'],
  'Frasco en polvo',
  '300 g',
  array['Apoya articulaciones y movilidad','Favorece elasticidad de la piel','Fortalece cabello y uñas'],
  'Diluir una cucharada en agua o jugo, una vez al día.',
  15,
  'https://placehold.co/600x600/EDE6D9/2F4A3C?text=Colageno',
  true
)
on conflict do nothing;

-- ============================================================
-- KALOMAI — hoteles/resort (Travel), lotes (Bienes y Raíces)
-- y galería de Kalomai Park
-- ============================================================

-- ---------------------------------------------------------------
-- Tabla: hoteles (Kalomai Travel y Kalomai Resort)
-- ---------------------------------------------------------------
create table if not exists hoteles (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null default 'hotel' check (tipo in ('hotel', 'resort')),
  descripcion text not null default '',
  ubicacion text not null default '',
  fotos text[] not null default '{}',
  activo boolean not null default true,
  fecha_creacion timestamptz not null default now()
);

create index if not exists idx_hoteles_tipo on hoteles (tipo);
create index if not exists idx_hoteles_activo on hoteles (activo);

alter table hoteles enable row level security;

create policy "Lectura pública de hoteles activos"
  on hoteles for select
  using (true);

create policy "Administradores gestionan hoteles"
  on hoteles for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------
-- Tabla: lotes (Bienes y Raíces)
-- ---------------------------------------------------------------
create table if not exists lotes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text not null default '',
  precio numeric(12, 2) not null default 0 check (precio >= 0),
  ubicacion text not null default '',
  fotos text[] not null default '{}',
  disponible boolean not null default true,
  activo boolean not null default true,
  fecha_creacion timestamptz not null default now()
);

create index if not exists idx_lotes_activo on lotes (activo);

alter table lotes enable row level security;

create policy "Lectura pública de lotes activos"
  on lotes for select
  using (true);

create policy "Administradores gestionan lotes"
  on lotes for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------
-- Tabla: park_galeria (Kalomai Park — solo fotos, sin precios)
-- ---------------------------------------------------------------
create table if not exists park_galeria (
  id uuid primary key default gen_random_uuid(),
  imagen_url text not null,
  descripcion text not null default '',
  orden integer not null default 1,
  activo boolean not null default true
);

alter table park_galeria enable row level security;

create policy "Lectura pública de galería Park"
  on park_galeria for select
  using (true);

create policy "Administradores gestionan galería Park"
  on park_galeria for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------
-- Storage: bucket "kalomai" para fotos de hoteles, lotes y park
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('kalomai', 'kalomai', true)
on conflict (id) do nothing;

create policy "Lectura pública bucket kalomai"
  on storage.objects for select
  using (bucket_id = 'kalomai');

create policy "Administradores suben a kalomai"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'kalomai');

create policy "Administradores actualizan kalomai"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'kalomai');

create policy "Administradores eliminan de kalomai"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'kalomai');
