# Estudio de integración SII (Chile) — 22 de octubre de 2026

## Resultado

**Es técnicamente posible conectar la plataforma con la emisión electrónica**, pero no se logra publicando la página estática ni enlazando el portal gratuito del Servicio de Impuestos Internos.

El SII distingue:

1. **Sistema gratuito del SII:** permite emitir DTE mediante el portal del contribuyente. Según la descripción oficial, no está pensado para integración directa con software ERP externo.
2. **Sistema de facturación propio o de mercado:** admite integración con ERP y sistemas empresariales, con requisitos técnicos, certificación/validación de DTE y autorización tributaria aplicables.
3. **Servicio API de terceros:** algunos proveedores comerciales ofrecen endpoints REST, ambiente de prueba y mecanismos para envío/consulta de estados, pero sus condiciones comerciales, autorización, cobertura y seguridad requieren evaluación caso a caso.

Fuentes oficiales consultadas:
- https://www.sii.cl/destacados/factura_electronica/factura_etapas_2.html
- https://www.sii.cl/destacados/factura_electronica/factura_etapas_5.html
- https://www.sii.cl/factura_electronica/como_fact_elect.htm

Ejemplo de documentación comercial de integración (no se ha contratado, evaluado ni conectado):
- https://duodte.cl/api-docs.html
- https://lael.cl/api-docs

## Diseño propuesto

```text
Frontend
  → API de negocio autorizada por rol
  → Servicio de facturación (backend)
  → Proveedor DTE / integración SII certificada
  → callback/webhook de estado, conciliación, evidencia
  → PostgreSQL: invoice_id, folio, estado tributario, track id, errores
```

**Nunca** incluir certificados digitales, claves SII, tokens ni claves API de proveedores DTE en JavaScript del navegador. Los flujos de emisión deben mantenerse separados de las facturas administrativas; el usuario no debe confundir "registro interno" con "DTE aceptado por el SII".

## Para esta versión

- Se puede registrar el folio SII como referencia, generar documentos administrativos y exportar datos.
- **No** se firman XML, no se solicitan folios CAF, no se envían DTE, no se consulta emisión tributaria autenticada y no se generan facturas válidas por sí solas.
- Los usuarios deben utilizar su sistema SII/proveedor autorizado para la emisión real.

## Antes de implementar

Confirmar situación tributaria de cada cliente, emisor DTE, cantidad de DTE por mes, tipo de documentos, facturación parcial/estados de pago, tratamiento de notas de crédito, manejo de rechazos, soporte y costo total del proveedor.
