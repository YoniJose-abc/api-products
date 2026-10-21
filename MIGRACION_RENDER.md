# Migración de productos a Render

`migracion.sql` contiene la estructura de `public.productos`, su secuencia y los 15 registros consultados en `productos_db` del contenedor `postgres-productos`, conservando sus IDs del 1 al 15. Las consultas al origen (PostgreSQL 17.11) se ejecutaron en transacciones de solo lectura. No se ha ejecutado la migración en Render.

La sintaxis se revisó contra la documentación oficial de PostgreSQL 18 para [CREATE TABLE](https://www.postgresql.org/docs/18/sql-createtable.html), [CREATE SEQUENCE](https://www.postgresql.org/docs/18/sql-createsequence.html), [INSERT](https://www.postgresql.org/docs/18/sql-insert.html) y [ALTER SEQUENCE](https://www.postgresql.org/docs/18/sql-altersequence.html). `RESTART WITH 16` configura el próximo ID sin consumirlo y es transaccional.

## Preparación

1. Instala el cliente PostgreSQL y comprueba que `psql --version` funciona en PowerShell.
2. En el Dashboard de Render, abre la base PostgreSQL de destino y copia su **External Database URL** desde la sección de conexiones/Info. Comprueba que sea la base correcta y que el acceso externo permita tu IP.
3. El destino debe tener libres los nombres `public.productos` y `public.productos_id_seq`. El script crea ambos objetos y falla si existen; no elimina ni reemplaza tablas. Se ejecuta dentro de una transacción.
4. Ejecuta los comandos desde la carpeta del repositorio. La URL se solicitará de forma oculta: no la pegues en archivos, comandos literales, `.env` ni commits.

Render documenta el acceso externo y TLS en [Create and Connect to Render Postgres](https://render.com/docs/postgresql-creating-connecting).

## Ejecutar cuando decidas migrar

Este bloque **sí escribe en Render** al ejecutarlo. Usa el cliente `psql` instalado en Windows y mantiene las credenciales temporalmente en memoria.

```powershell
$renderUrlSecure = Read-Host 'External Database URL de Render' -AsSecureString
$renderUrlPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($renderUrlSecure)
$previousSslMode = $env:PGSSLMODE
try {
    $renderUrl = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($renderUrlPointer)
    $env:PGSSLMODE = 'require'
    # Si la URL incluye sslmode, debe indicar require o verify-full.
    & psql -X --dbname "$renderUrl" --set=ON_ERROR_STOP=1 --file .\migracion.sql
    if ($LASTEXITCODE -ne 0) {
        throw 'La migración falló. Revisa el error antes de volver a ejecutarla.'
    }

    # Verificación de solo lectura en el destino.
    & psql -X --dbname "$renderUrl" --set=ON_ERROR_STOP=1 --command 'SELECT id, nombre, precio, categoria FROM public.productos ORDER BY id; SELECT count(*) AS registros FROM public.productos; SELECT last_value, is_called FROM public.productos_id_seq;'
    if ($LASTEXITCODE -ne 0) {
        throw 'La migración terminó, pero falló la verificación.'
    }
}
finally {
    $env:PGSSLMODE = $previousSslMode
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($renderUrlPointer)
    $renderUrl = $null
    $renderUrlSecure.Dispose()
    Remove-Variable renderUrl, renderUrlSecure, renderUrlPointer, previousSslMode -ErrorAction SilentlyContinue
}
```

La verificación debe mostrar 15 filas con IDs del 1 al 15. La secuencia debe mostrar `last_value = 16` e `is_called = false`: la próxima inserción que omita `id` recibirá 16. No uses `nextval` para comprobarlo, porque avanzaría la secuencia.

Tras una ejecución exitosa, no repitas el script: los objetos ya existirán. Si ocurre un error antes del `COMMIT`, `ON_ERROR_STOP` detiene `psql` y la transacción se revierte al cerrar la conexión. Si se pierde la conexión durante el `COMMIT`, comprueba el estado del destino antes de reintentar.
