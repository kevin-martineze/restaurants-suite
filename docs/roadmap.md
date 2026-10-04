# Roadmap

## Cómo se trabaja: por rebanadas

Ni toda la visual primero ni toda la lógica primero. Cada flujo pasa por el
mismo ciclo:

```
UI con datos de prueba → probar en el celular con 3 a 5 personas reales → servicio en la API → cambiar los datos de prueba por la API
```

Por qué:

- Una interfaz con datos inventados esconde los problemas difíciles (máximo de
  salsas, combos con adiciones, agotados con el pedido ya en el carrito, quince
  pedidos a la vez en cocina). Diseñar todo antes obliga a rediseñar la mitad.
- Construir la lógica antes produce servicios para pantallas que, al mostrarlas,
  sobran o están mal planteadas.

Lo que hace posible el ciclo: las páginas solo conocen `$lib/domain/*`. Al
principio `$lib/server/api/menu.ts` devuelve fixtures; después, el mismo archivo
llama a la API real y las pantallas no se tocan (ver `CLAUDE.md`, regla 19).

**Regla que no se negocia ni con fixtures:** el precio lo calcula el servidor.

## Paso 0: el contrato (1 a 2 días)

- Tipos del dominio en `$lib/domain/`: `Menu`, `Category`, `Item`,
  `ModifierGroup`, `Modifier`, `CartLine`, `Order` y los estados del pedido.
- Fixtures de un restaurante real de Barranquilla, con su carta de verdad.

## Rebanadas

| #   | Rebanada                                                                  | Por qué en este orden                                                |
| --- | ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | **Carta web + hoja de opciones + carrito** ([carta-web.md](carta-web.md)) | Es lo que vende el producto y lo que más hay que validar visualmente |
| 2   | **Checkout**: tipo de entrega, dirección con pin, pago, confirmación      | Aquí aparecen zonas, mínimo y horario                                |
| 3   | **Tablero del restaurante y cocina**                                      | Recibe lo que produce la 2; sin eso no hay piloto                    |
| 4   | **Panel de menú** (crear productos y modificadores)                       | Al principio los menús de los pilotos se cargan a mano               |
| 5   | **WhatsApp y seguimiento**                                                | Va encima de los estados que ya existen                              |
| 6   | **Domiciliario**                                                          | Lo último del piloto                                                 |

## Plan de 90 días (equipo de 2 a 3 personas)

| Semanas | Producto                                                                         | Negocio                                                                                  |
| ------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1–2     | Paso 0 y rebanada 1 con fixtures                                                 | 20 entrevistas en Barranquilla. Cerrar 5 restaurantes piloto gratis a cambio de feedback |
| 3–4     | Módulo de menú en la API, carga desde foto con IA, cotización y zonas            | **Arrancar el trámite de Meta Business y Tech Provider (tarda semanas)**                 |
| 5–6     | Checkout (Wompi + efectivo), tablero en tiempo real, alertas, comanda impresa    | Comprar 2 kits de tablet + impresora para los pilotos                                    |
| 7–8     | WhatsApp (Embedded Signup, plantillas, link mágico) y seguimiento                | Pilotos 1 y 2 en vivo; ir al local en hora pico                                          |
| 9–10    | Web del domiciliario, OTP, liquidación de efectivo, cocina, roles por sucursal   | Los 5 pilotos en vivo; kit de stickers "pide directo"                                    |
| 11–12   | Reportes y "ahorro vs. agregador", CSV, cobro de planes, onboarding autoservicio | Convertir pilotos a pago; precio validado; 10 restaurantes nuevos                        |
| 13      | Endurecimiento: Sentry, carga de hora pico simulada, respaldos                   | Lanzamiento público en Barranquilla con cifras reales                                    |
