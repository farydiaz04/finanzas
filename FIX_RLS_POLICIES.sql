-- FIX RLS POLICIES FOR user_settings
-- Ejecuta este script en Supabase SQL Editor para arreglar los permisos

-- 1. Eliminar la política existente que no funciona
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;

-- 2. Crear políticas específicas para cada operación
-- Política para SELECT (leer)
CREATE POLICY "Users can view their own settings" 
ON user_settings FOR SELECT 
USING (auth.uid() = user_id);

-- Política para INSERT (crear)
CREATE POLICY "Users can insert their own settings" 
ON user_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE (actualizar)
CREATE POLICY "Users can update their own settings" 
ON user_settings FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política para DELETE (eliminar)
CREATE POLICY "Users can delete their own settings" 
ON user_settings FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_settings';
