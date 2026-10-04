# Negocio

## Cobro (cifras orientativas: validar con los pilotos)

- **Mensaje central: 0% de comisión por pedido.**
- Planes mensuales en COP:
  - _Arranque_, ~$89.000: 1 sucursal, menú, link y QR, pedidos, WhatsApp básico, 1 domiciliario.
  - _Pro_, ~$179.000: cocina, domiciliarios ilimitados, reportes, fidelización e IA.
  - _Multisucursal_: ~$129.000 por sucursal adicional. Dark kitchen: ~$49.000 por marca adicional.
- Onboarding asistido (pago único, ~$150.000 a $300.000): menú, fotos, kit de QR
  y stickers, configuración de la tablet.
- Hardware con margen: kit de tablet + impresora.
- WhatsApp: cuota incluida; el excedente a costo más margen.
- Flota externa: fee por despacho.
- **No** cobrar porcentaje sobre el pago en la v1: nos volvería agregador de
  pagos (con regulación) y destruiría el mensaje. El dinero cae directo en la
  cuenta Wompi del restaurante.

## Métricas de product-market fit

| Métrica                                                                   | Meta              |
| ------------------------------------------------------------------------- | ----------------- |
| Activación: restaurantes con ≥20 pedidos directos en sus primeros 14 días | ≥ 60%             |
| Pedidos de WhatsApp que entran por el link (al mes 2)                     | ≥ 70%             |
| Clientes finales que repiten en 30 días                                   | ≥ 35%             |
| Ventas a domicilio por canal directo vs. agregador                        | Al alza mes a mes |
| Tiempo mediano de aceptación                                              | < 2 min           |
| Entregas a tiempo                                                         | ≥ 85%             |
| Cancelación                                                               | < 4%              |
| Churn mensual de restaurantes                                             | < 4%              |
| NRR                                                                       | > 100%            |
| Payback del CAC                                                           | < 6 meses         |
| Prueba de Sean Ellis ("muy decepcionado" si desaparece)                   | ≥ 40%             |

## Riesgos

| Tipo      | Riesgo                                                      | Mitigación                                                                                                                                                                          |
| --------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Técnico   | Meta suspende el número o rechaza plantillas                | Plantillas utility sobrias, opt-in registrado, calidad del número monitoreada, respaldo por link                                                                                    |
| Técnico   | Tracking poco confiable en web                              | Prometer eventos con hora en la v1, no un mapa en vivo perfecto; Capacitor en la v2                                                                                                 |
| Técnico   | Internet del restaurante inestable                          | Alertas redundantes (tablet + WhatsApp al dueño), reintentos, cola de impresión local                                                                                               |
| Técnico   | Fuga de datos entre tenants                                 | Repositorios que siempre filtran por `tenantId`, pruebas por tenant, auditoría de soporte                                                                                           |
| Legal     | Habeas Data (Ley 1581 de 2012, Decreto 1377 de 2013)        | El restaurante es responsable y nosotros encargados: contrato de transmisión, política por tenant, consentimiento separado (servicio y marketing), derecho a borrar, RNBD si aplica |
| Legal     | Relación laboral de domiciliarios (reforma laboral de 2025) | Los domiciliarios propios son del restaurante; nosotros damos el software. Validar el modelo de flota con abogado laboral antes de la v2                                            |
| Legal     | Facturación electrónica DIAN e impuesto al consumo          | En la v1 no facturamos: exportamos o integramos con el software del restaurante. Impuesto al consumo vs. IVA configurable por tenant                                                |
| Legal     | Propina (Ley 1935 de 2018)                                  | Si se cobra en mesa: voluntaria, informada y discriminada                                                                                                                           |
| Operativo | El restaurante no cambia el hábito                          | Onboarding presencial, cajero entrenado, "todo pedido entra por el link"                                                                                                            |
| Operativo | El agregador responde con promociones de exclusividad       | No competir por su demanda: convertir a los clientes recurrentes                                                                                                                    |
