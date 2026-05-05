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

-- Permitir la actualización anónima temporal (Necesario para que cualquiera que escanee el QR pueda actualizar el campo "lastScan" con el GPS)
-- Nota: En un entorno de producción estricto, es mejor usar un RPC para esto, pero esta política emula el comportamiento abierto que tenías en Firebase.
CREATE POLICY "Anon can update scans" ON public.pets
FOR UPDATE USING (auth.role() = 'anon' OR auth.role() = 'authenticated');

-- 4. Habilitar Realtime para la tabla pets
alter publication supabase_realtime add table public.pets;
