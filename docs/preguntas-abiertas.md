# Preguntas abiertas

Lo que falta decidir. Cuando se responda, se mueve a
[decisiones.md](decisiones.md).

## Producto y marca

- [ ] **Nombre del producto.** Al decidirlo: cambiar `PRODUCT_NAME` en
      `src/lib/brand.ts`, revisar marca en la SIC y el dominio `.co`, y
      renombrar los repos si hace falta.
- [ ] Identidad visual (logo, paleta): reemplaza los tokens neutros de
      `src/app.css`.

## Antes de construir más allá de la rebanada 1

- [ ] ¿Qué % de los pedidos de los pilotos llega hoy por WhatsApp, por
      agregador y en el local? Si WhatsApp es menos del 20%, el dolor no alcanza.
- [ ] ¿Los restaurantes objetivo tienen domiciliarios propios? Define si la
      flota externa es v1 o v2.
- [ ] ¿Quién paga los mensajes de WhatsApp? ¿Aceptan conectar su número a la
      API (o usar coexistencia)?
- [ ] ¿Qué POS y qué software de facturación electrónica usan?
- [ ] ¿La contraentrega en efectivo es mayoría?
- [ ] ¿Quién vende y hace el onboarding presencial?
- [ ] Hardware: ¿lo vendemos, lo prestamos o lo pone el restaurante?
- [ ] Precio máximo que paga sin pensarlo un restaurante de ticket ~$35.000
      (validar con pilotos, no con encuestas).
- [ ] Contrato de encargado de datos y términos de servicio, antes del primer
      cliente que pague.

## Técnicas

- [ ] Impresora de comandas: Sunmi integrada vs. Bluetooth ESC/POS.
- [ ] Migración a Node 22.
- [ ] Carta real de un restaurante para los fixtures de la rebanada 1.
