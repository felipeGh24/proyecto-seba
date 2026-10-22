# Despliegue en Vercel · Voltage Obras V8

## Opción rápida
1. Sube esta carpeta completa a GitHub.
2. Entra a Vercel con tu cuenta.
3. Elige **Add New Project**.
4. Importa el repositorio.
5. Vercel detectará `package.json`.
6. Verifica estos valores:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
7. Haz clic en **Deploy**.

## Opción ultra simple para mostrarlo ya
Si solo quieres que tu amigo vea una versión portable local, abre:
- `ABRIR_VOLTAGE_OBRAS_V8.html`

## Qué quedó preparado
- `vercel.json` ya configurado.
- `dist/index.html` listo para despliegue.
- `dist/ABRIR_VOLTAGE_OBRAS_V8.html` versión portable.

## Nota
Si luego quieres conectar base de datos real, autenticación o backend, habrá que agregar variables de entorno y servicios externos. Esta versión sigue preparada como demo/local-first.
