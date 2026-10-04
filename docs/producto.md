# Producto

> El nombre está pendiente. Mientras tanto, en código es `PRODUCT_NAME` en
> `src/lib/brand.ts`, y en los documentos, "el producto".

## Propuesta de valor

**Vende por WhatsApp y tu propio link sin pagar comisión, con cocina, pagos y
domicilios en un solo panel, y quédate con tus clientes.**

## Posicionamiento

El canal de venta directo del restaurante colombiano. No es un agregador más ni
un POS: es la capa que convierte el WhatsApp desordenado del restaurante en un
sistema de pedidos, cocina y domicilios, con 0% de comisión y donde el cliente
le pertenece al restaurante.

| Frente a                        | La diferencia                                                                                      |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| Rappi / PedidosYa               | Sin comisión por pedido, el cliente es del restaurante y no compite contra otros en la misma app   |
| Menús QR genéricos              | Operación completa: cocina, domicilio y pagos, no solo una carta                                   |
| POS (Loggro, Vendty, Siigo POS) | Nace en WhatsApp y en el domicilio, no en la caja. Se integra con el POS, no lo reemplaza en la v1 |

**Regla de oro:** nunca mostrarle al cliente de un restaurante otros
restaurantes. El día que lo hagamos, somos otro agregador.

## Mercado inicial

- Ciudad piloto: **Barranquilla**; luego otras ciudades de la costa y del país.
- Clientes: restaurantes pequeños y medianos, cafeterías, pizzerías, comida
  rápida, asados, dark kitchens y cadenas con varias sucursales.

## Problemas que resuelve

### Restaurante

- Paga entre 18 y 30% de comisión al agregador → canal directo con tarifa fija.
- Toma pedidos a mano por WhatsApp (errores, audios, "¿cuánto es?") → el cliente
  arma su pedido en la carta web y el total sale calculado.
- No conoce a sus clientes → base propia con consentimiento, historial y reorden.
- Comprobantes de Nequi falsos o sin verificar → pago conciliado por pasarela.
- No sabe dónde va el domiciliario → eventos con hora y ubicación, alertas.
- Vende algo agotado y luego tiene que llamar a cancelar → el agotado en cocina
  se refleja en la carta al instante.

### Cliente

- "¿Ya salió mi pedido?" sin respuesta → seguimiento y avisos por WhatsApp.
- Repetir la dirección y explicar cómo llegar → direcciones guardadas con pin,
  referencias y foto de la fachada.
- Bajarse otra app → sin app y sin registro: entra por link o WhatsApp.

### Domiciliario

- Direcciones ambiguas → pin en el mapa, referencias y navegación en un toque.
- Discusiones por plata → monto a cobrar y cambio visibles; liquidación del turno.
- Llamadas cruzadas → estados en la app y botón de incidencia.

## Cómo entra el cliente

QR en la mesa o en la bolsa, link en Instagram, o un mensaje de WhatsApp que
responde con el link de la carta. La carta tiene dos modos:

- **Carta QR** (en la mesa): solo lectura, o pedido a la mesa en versiones
  posteriores.
- **Pedido**: domicilio o recoger en tienda, con carrito y pago.
