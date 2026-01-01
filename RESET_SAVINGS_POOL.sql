-- Script para Resetear el Pozo de Ahorros en Supabase
-- Ejecuta esto en el SQL Editor de Supabase

-- Opción 1: Resetear a 0
UPDATE user_settings 
SET manual_savings_pool = 0, 
    updated_at = NOW()
WHERE user_id = auth.uid();

-- Opción 2: Establecer a un valor específico (ejemplo: 100000)
-- UPDATE user_settings 
-- SET manual_savings_pool = 100000, 
--     updated_at = NOW()
-- WHERE user_id = auth.uid();

-- Verificar el cambio
SELECT user_id, manual_savings_pool, updated_at 
FROM user_settings 
WHERE user_id = auth.uid();
