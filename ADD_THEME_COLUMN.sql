-- AGREGAR COLUMNA 'theme' FALTANTE A user_settings
-- Ejecuta este script PRIMERO en Supabase SQL Editor

-- Agregar la columna theme si no existe
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'system';

-- Verificar que se agregó correctamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
ORDER BY ordinal_position;
