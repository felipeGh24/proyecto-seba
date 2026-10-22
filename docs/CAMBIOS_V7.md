# Cambios V7 frente a V6

- Refactor del código fuente en 24 archivos por módulo y responsabilidad.
- Mantiene el código funcional del motor principal de V6 (reorganización sin reescritura destructiva).
- 6 hojas de estilos separadas, con tokens Voltage.
- Construcción reproducible con Node.js estándar, sin bibliotecas adicionales.
- HTML portátil auto-contenido, index.html de carpeta y ZIP con código fuente.
- Pruebas automatizadas de sintaxis, estructura, RUT, IVA y descuentos: 5/5.
- Prueba visual y funcional con Chromium: navegación de 10 apartados, vista móvil, notificaciones y descarga de 2 PDF, sin errores de JavaScript en los escenarios comprobados.

**No se ha agregado autenticación, base de datos compartida ni integración real con el SII.**

El repositorio en esta etapa es un *monolito modular de fuentes*, con funciones y estado global dentro de una única IIFE compilada; hay acoplamiento heredado que debe refactorizarse con tests más exhaustivos antes de adoptar ESM/TypeScript o backend.
