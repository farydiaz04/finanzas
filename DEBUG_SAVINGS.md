# DEBUG: Verificar Valor de Ahorros en Supabase

## Problema
El pozo de ahorros sigue regresando a $600,000 después de refrescar.

## Pasos de Depuración

### 1. Verificar qué hay en Supabase
Abre tu dashboard de Supabase: https://supabase.com/dashboard/project/hupdwrzrgapfhhswcxmx

1. Ve a **Table Editor** en el menú lateral
2. Selecciona la tabla `user_settings`
3. Busca tu registro (debería haber solo 1 fila con tu `user_id`)
4. Verifica el valor de la columna `manual_savings_pool`

**Pregunta crítica**: ¿Qué valor ves ahí? ¿Es 600000?

### 2. Si el valor en Supabase ES 600000
Entonces el problema es que **Supabase tiene el valor incorrecto guardado**. Necesitas:

**Opción A - Editar directamente en Supabase:**
1. En Table Editor, haz clic en la fila de `user_settings`
2. Edita el campo `manual_savings_pool` al valor que desees (ej: 100000)
3. Guarda
4. Refresca la app

**Opción B - Usar la consola del navegador:**
1. Abre la app en el navegador
2. Abre DevTools (F12 o Cmd+Option+I)
3. Ve a la pestaña **Console**
4. Pega este código:
```javascript
// Limpiar localStorage completamente
localStorage.clear()

// Recargar la página
location.reload()
```
5. Después de recargar, ve a la página de Ahorros
6. Edita el pozo manualmente al valor que quieras
7. Espera a ver el indicador "SINCRO..."
8. Refresca la página para confirmar

### 3. Si el valor en Supabase NO es 600000
Entonces hay otro problema. Necesitamos ver los logs de la consola:

1. Abre DevTools (F12)
2. Ve a Console
3. Refresca la página
4. Busca mensajes que digan "Error syncing settings" o similares
5. Copia y pega cualquier error que veas

## Cambios Realizados en el Código

He eliminado **COMPLETAMENTE** el uso de localStorage para usuarios autenticados:

### Antes:
- localStorage se leía al inicio
- localStorage se guardaba automáticamente en cada cambio
- localStorage se guardaba en syncSettings

### Ahora:
- ✅ localStorage **SOLO** se usa si NO hay usuario autenticado (modo offline)
- ✅ Cuando estás autenticado, **SOLO Supabase** se usa
- ✅ No hay auto-guardado a localStorage
- ✅ syncSettings **NO** guarda a localStorage

## Próximos Pasos

1. **Limpia la caché del navegador/PWA** (CRUCIAL)
2. **Verifica Supabase** siguiendo los pasos arriba
3. **Reporta** qué valor ves en la base de datos
4. Si el valor en Supabase es correcto pero la app muestra 600000, hay un bug de lectura
5. Si el valor en Supabase es 600000, necesitas editarlo manualmente una vez

## Código Relevante

Ver [`context/finance-context.tsx`](file:///Users/faryddiaz/.gemini/antigravity/playground/galactic-apogee/context/finance-context.tsx):
- Línea 428-444: localStorage solo carga si NO hay usuario
- Línea 524-537: Auto-save solo si NO hay usuario  
- Línea 549-568: syncSettings NO guarda a localStorage
