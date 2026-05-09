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
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON public.pets;
DROP POLICY IF EXISTS "Users can insert their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can update their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can delete their own pets" ON public.pets;
DROP POLICY IF EXISTS "Anon can update scans" ON public.pets; -- < ELIMINAMOS LA VULNERABLE
CREATE POLICY "Public read access" ON public.pets
FOR SELECT USING (true);
CREATE POLICY "Users can insert their own pets" ON public.pets
FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Users can update their own pets" ON public.pets
FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "Users can delete their own pets" ON public.pets
FOR DELETE USING (auth.uid() = "userId");
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
alter publication supabase_realtime add table public.pets;
