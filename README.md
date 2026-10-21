# API de productos

API de consulta sobre la tabla existente `productos`. No ejecuta migraciones ni modifica registros.

## Uso local

Requiere Node.js 22 o superior y PostgreSQL disponible. Copia `.env.example` a `.env` si no tienes configuración local y completa las credenciales.

```sh
npm ci
npm start
```

Consulta `http://localhost:3000/api/productos` o `http://localhost:3000/api/productos/1`.

Las respuestas correctas usan `{ "data": ... }`. Los errores usan `{ "data": null, "error": "..." }`: 400 para ID inválido, 404 para producto inexistente y 500 para errores internos. Solo se implementan consultas GET.

## GitHub y Render

Sube el proyecto y `package-lock.json` a GitHub. `.env` y `node_modules` están excluidos de Git.

En Render configura un servicio Node con comando de construcción `npm ci` y comando de inicio `npm start`. Define `DATABASE_URL` como variable secreta con la conexión a una base PostgreSQL accesible desde Render que ya contenga la tabla y los datos. También puedes configurar `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` y `PGPASSWORD` en lugar de `DATABASE_URL`.

`localhost:5433` corresponde al equipo local y no es accesible como tal desde Render. Usa la URL proporcionada por el proveedor de tu base; si requiere TLS, incluye su configuración SSL en la URL. La aplicación utiliza el puerto `PORT` del entorno y escucha en `0.0.0.0`.
