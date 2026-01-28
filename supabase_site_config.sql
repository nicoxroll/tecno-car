-- 1. Crear la tabla de configuración si no existe
create table if not exists public.site_config (
  key text primary key,
  value text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar Row Level Security (RLS)
alter table public.site_config enable row level security;

-- 3. Crear políticas de seguridad

-- Permitir lectura a todo el mundo (necesario para ver si está en mantenimiento o leer info del sitio)
create policy "Configuración pública para leer"
on public.site_config for select
to public
using (true);

-- Permitir gestión completa solo a usuarios autenticados (admin)
create policy "Configuración editable por admin"
on public.site_config for all
to authenticated
using (true)
with check (true);

-- 4. Insertar valores iniciales para las nuevas funcionalidades
insert into public.site_config (key, value)
values 
  ('maintenance_mode', 'false'),
  ('ai_knowledge_base', 'Somos Merlano Tecnología Vehicular, especialistas en electrónica automotriz.')
on conflict (key) do nothing;
