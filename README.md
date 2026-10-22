# VOLTAGE OBRAS V7 — ARQUITECTURA MODULAR

## Abrir ahora (sin instalar nada)

Descarga y abre `dist/ABRIR_VOLTAGE_OBRAS_V7.html` con Chrome o Edge. También puedes abrir `dist/index.html` conservando la carpeta `dist/assets`.

## Editar la aplicación

No edites `dist/assets/app.js`: es un resultado generado. Modifica `src/features/` según la sección, `src/domain/` para cálculos, `src/infrastructure/` para persistencia o `src/styles/` para diseño. Después ejecuta:

```bash
npm run build
npm test
```

Solo requiere Node.js 20+ para desarrollo. No hace falta servidor, instalación de paquetes ni ejecutar archivos .bat.

## Qué cambió respecto de V6

- Separación de 24 módulos fuente con dependencias ordenadas en `src/manifest.json`.
- Separación de los estilos, tokens del diseño corporativo y motores PDF.
- Compilación reproducible de una web estática y un HTML autoejecutable.
- Pruebas básicas automatizadas de construcción y de reglas de negocio.
- Documentación técnica con arquitectura actual y límites.

## Qué permanece igual

Interfaz lateral oscura y área derecha blanca, ocho empresas demo, navegación, notificaciones, trazabilidad, cotizaciones, facturas y cobros, proyectos/Gantt, costos, reportes PDF y prevalidación SII. La base de datos sigue siendo `localStorage`, sin integración tributaria activa. Los documentos de preparación SII NO son DTE.

**Respalda tus datos JSON antes de usar una versión nueva; no borres la V6 original.**
