# Arquitectura informática, trazabilidad y plan de evolución

## 1. Propósito del prototipo

Digitalizar el ciclo de gestión de una empresa constructora pequeña: cotización, aprobación, proyecto, planificación, facturación administrativa, cuentas por cobrar y seguimiento de pagos. Evitar que el dashboard muestre todos los detalles; los registros especializados quedan en sus módulos. Las alertas representan datos calculados, no colores puestos manualmente.

## 2. Modelo de información recomendado para producción

Propuesta relacional PostgreSQL (no implementada todavía):

- `organizations`: razón social, datos comerciales y tributarios.
- `organization_members`: membresías `organization_id` + `user_id`, rol y estado.
- `clients`: contacto, RUT y datos de facturación, por organización.
- `quotes`: estado, moneda, tasa IVA, fecha, vencimiento, cliente y folio interno.
- `quote_sections`, `quote_items`: partidas, unidades, cantidades, precios, descuentos.
- `projects`: relación con cliente y, opcionalmente, cotización de origen.
- `project_tasks`: jerarquía, fecha planificada/real, avance, responsable y monto.
- `invoices`: estado tributario, folio SII, origen comercial, monto emitido, vencimiento y proyecto.
- `invoice_payments`: abonos múltiples con fecha, referencia, monto y medio.
- `activity_events`: auditoría append-only de operaciones, actor, entidad y cambios.
- `attachments`: metadatos de documentos y archivos con reglas de acceso.
- `document_sequences`: numeración atómica **en el servidor**, por organización y tipo.
- `integration_connections`, `dte_operations`: configuración, identificadores externos y seguimiento de estados del proveedor de facturación.

Cada recurso multiempresa debe tener `organization_id` y controles RLS (Row Level Security). Las funciones del servidor también deben validar membresía/permisos antes de permitir operaciones. No exponer claves de servicio, tokens ni certificados al navegador.

## 3. Flujos y semáforos

### Cotización / presupuesto

- **Recibida (azul):** nuevo requerimiento ingresado.
- **En preparación (amarillo):** revisión técnica, elaboración de partidas, cálculo de montos.
- **Enviada (azul):** propuesta enviada al cliente, esperando respuesta.
- **Aprobada (verde):** orden aceptada; puede originar proyecto y documentos de cobro.
- **Rechazada (rojo):** propuesta no adjudicada.
- **Facturada:** estado de relación comercial con documento de cobro, no implica cobrado.

La app también mantiene `borrador` por compatibilidad con el proyecto original.

### Proyectos

Semáforo **derivado de la comparación entre avance real y avance planificado** sobre tareas, fechas y montos. En producción deben validarse los umbrales con personal de obra y hacerlos parametrizables, incorporar hitos de recepción y evidencia documental.

### Factura y cobranza

El estado tributario de una factura debe separarse del estado de cobranza. Los pagos parciales reducen saldo, sin dar una factura por pagada hasta que su saldo llegue a cero. Una factura parcialmente pagada puede igualmente estar **vencida**.

## 4. Desarrollo por etapas

**Fase A — Demo (esta entrega).** UI corporativa, navegación, facturas administrativas, cotizaciones rápidas y detalladas, semáforos, proyectos/Gantt, trazabilidad documental, abonos, reportes, descarga/restauración local.

**Fase B — Validación.** Revisar con Seba y un usuario constructor: roles reales, cálculos, condiciones de pago, documentos comerciales, vencimientos, tablero móvil y flujos concretos. Pruebas de importación desde Excel con muestras autorizadas.

**Fase C — Plataforma productiva.** Extraer servicios de negocio, diseñar REST/API o server actions, esquema PostgreSQL, autenticación Supabase, permisos RLS, auditoría del lado servidor, respaldos, monitoreo, gestión de incidencias y pipeline CI/CD. No llevar el `local-adapter.js` a producción.

**Fase D — Integración SII.** Seleccionar proveedor autorizado/API o implementar certificación de emisión propia; trabajar en ambiente de pruebas, validar RUT y giros, folios, documentos de corrección, reintentos, conciliación, monitoreo y permisos tributarios.

**Fase E — Comercialización.** Definir titularidad del código, contratos, protección de datos, acuerdo de soporte, SLA, alcance de cambios, distribución de costos y condiciones de la infraestructura.

## 5. Aspectos pendientes que no pueden simularse

- Autenticación y seguridad multiusuario.
- Sincronización en múltiples dispositivos y conflictos de edición.
- Numeración de documentos garantizada bajo concurrencia.
- Copias automáticas, restauración y pruebas de recuperación.
- Auditoría inmutable, trazas firmadas por usuario real.
- Integración y certificación tributaria SII.
- Pruebas formales de seguridad y carga.

El software de demo **no debe ser representado como apto para manejar datos sensibles de clientes**.
