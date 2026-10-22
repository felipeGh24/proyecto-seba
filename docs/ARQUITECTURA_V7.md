# Arquitectura de Voltage Obras V7

## Patrón aplicado: monolito modular, por funcionalidades y por capas

Objetivo: facilitar lectura, edición, pruebas y mantenimiento sin perder la demo HTML local. La base anterior concentraba ~200 KB en `assets/app.js`. Ahora se divide en **24 archivos de lógica** agrupados por responsabilidad; el proceso de build los empaqueta en un único JS compatible con `file://`.

```
src/
  template/index.html      → estructura accesible y navegación
  styles/                  → tokens, base, tema Voltage y ajustes visuales
  core/                    → estado y utilidades comunes
  domain/                  → validaciones, cálculos, RUT, IVA y estados
  infrastructure/          → contrato de repositorio + almacenamiento local
  fixtures/                → empresas y operaciones ficticias
  features/
    inicio/                → dashboard y métricas
    trazabilidad/          → flujo comercial
    clientes/              → clientes
    cotizaciones/          → propuestas
    documentos/            → edición, cobranza y PDF comercial
    proyectos/             → cronograma y tareas
    costos/                → costos directos y margen
    tributario/            → prevalidación SII y notificaciones
    reportes/              → informes de gestión PDF
    empresa/               → datos y opciones de empresa
    ui/                    → contexto de cada sección
  reports/                 → motor PDF local
  app/                     → enrutador, eventos y arranque
  manifest.json            → orden determinista de composición
scripts/build.mjs          → arma `dist/` y el HTML portátil
```

### Capas lógicas

**Presentación** (`src/features`, `src/ui`): renderizados y formularios.  
**Aplicación** (`src/app`): navegación, comandos de usuario, ciclo de vida.  
**Dominio** (`src/domain`): reglas de cálculos y estados, no deberían depender del DOM.  
**Infraestructura** (`src/infrastructure`, `src/reports`): persistencia, descargas y exportación.  
**Datos demo** (`src/fixtures`): independientes de las reglas.

### Limites explícitos de esta versión

Esta etapa **modulariza el código fuente y el ensamblado, no convierte mágicamente V7 en un sistema de capas desacopladas**. Por compatibilidad, los archivos siguen compartiendo `S` y funciones de la IIFE del proyecto original. Algunos módulos añadidos en versiones anteriores usan decoradores de funciones (`mountReportes = ...`), que siguen activos. Migrarlos a módulos ES estrictos con imports/exports, TypeScript y puertos formales debe ser una etapa posterior con pruebas de regresión completas. La carga `file://` evita usar importaciones ES directas. No existe servidor ni permisos reales.

### Dependencias (permitidas)

- `domain` puede usar utilidades puras (`core/formatters`).
- `features` pueden usar dominio, estado y repositorio.
- `app` orquesta las `features`.
- `infrastructure` gestiona IO; no debe incluir reglas comerciales nuevas.

**Regla nueva:** no añadir funcionalidades dentro de `src/app/bootstrap.js` ni en `src/template/index.html`. Agregar cada funcionalidad en su módulo y registrarla en `src/manifest.json`, manteniendo el orden de inicialización.

### Arquitectura objetivo para producción (pendiente)

Frontend (React/Next.js) → API con autenticación y control de roles → servicios de aplicación → PostgreSQL/Supabase con RLS → integraciones externas (SII por canal autorizado). Contratos tipados, reglas desacopladas, pruebas unitarias/de integración y CI/CD. El adaptador local de demostración **no** debe usarse como base de datos empresarial productiva.

## Desarrollo local

Necesitas Node.js 20+ (sin `npm install` ni otras dependencias). 

```bash
npm run build
npm test
```

- `dist/index.html`: versión organizada en varios activos; abre desde la carpeta dist.
- `dist/ABRIR_VOLTAGE_OBRAS_V7.html`: una sola página portable que abre con doble clic.
- `dist/assets/app.js`: salida compilada; **no editar**. Modificar `src/`.

**Persistencia:** la clave local heredada de V6 se mantiene para no perder registros que ya tenga el navegador; el almacenamiento `file://` puede variar según navegador y ruta. Exportar JSON antes de mover, reemplazar o borrar archivos.
