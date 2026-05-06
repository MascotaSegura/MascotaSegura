-- Para migrar tu base de datos a Supabase, debes crear la tabla 'pets' y configurar sus políticas.
-- Ve a tu panel de Supabase > SQL Editor > Nuevo Query (New Query) y pega todo este código. Luego dale a "Run".

-- 1. Crear la tabla pets
CREATE TABLE IF NOT EXISTS public.pets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL,
    name TEXT,
    type TEXT,
    sex TEXT,
    sterilized TEXT,
    breed TEXT,
    medical TEXT,
    "ownerName" TEXT,
    "ownerPhone" TEXT,
    "ownerAltPhone" TEXT,
    photo TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "lastScan" JSONB
);

-- 2. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- 3. Crear Políticas de Acceso (Policies)

-- Primero eliminamos las políticas existentes para evitar errores si ejecutas esto varias veces
DROP POLICY IF EXISTS "Public read access" ON public.pets;
DROP POLICY IF EXISTS "Users can insert their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can update their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can delete their own pets" ON public.pets;
DROP POLICY IF EXISTS "Anon can update scans" ON public.pets; -- < ELIMINAMOS LA VULNERABLE

-- Permitir a cualquier persona leer el perfil de cualquier mascota (necesario para cuando escanean el QR)
CREATE POLICY "Public read access" ON public.pets
FOR SELECT USING (true);

-- Permitir a los usuarios autenticados insertar sus propias mascotas
CREATE POLICY "Users can insert their own pets" ON public.pets
FOR INSERT WITH CHECK (auth.uid() = "userId");

-- Permitir a los usuarios autenticados actualizar sus mascotas
CREATE POLICY "Users can update their own pets" ON public.pets
FOR UPDATE USING (auth.uid() = "userId");

-- Permitir a los usuarios autenticados eliminar sus mascotas
CREATE POLICY "Users can delete their own pets" ON public.pets
FOR DELETE USING (auth.uid() = "userId");

-- 4. Función Segura para Actualizar Escaneos (RPC)
-- Esta función reemplaza la política insegura anterior. Permite que cualquier persona
-- que escanee el QR actualice ÚNICAMENTE la columna "lastScan", sin tener acceso a modificar el nombre, dueño o foto de la mascota.
CREATE OR REPLACE FUNCTION update_last_scan(p_pet_id UUID, p_lat FLOAT DEFAULT NULL, p_lng FLOAT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  IF p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
    UPDATE public.pets
    SET "lastScan" = jsonb_build_object('timestamp', now(), 'lat', p_lat, 'lng', p_lng)
    WHERE id = p_pet_id;
  ELSE
    UPDATE public.pets
    SET "lastScan" = jsonb_build_object('timestamp', now())
    WHERE id = p_pet_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Habilitar Realtime para la tabla pets
alter publication supabase_realtime add table public.pets;
