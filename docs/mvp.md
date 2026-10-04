# Alcance del MVP

Criterio: lo que necesita un restaurante de Barranquilla para **dejar de tomar
pedidos a mano por WhatsApp desde la primera semana**.

## V1 (primeros 90 días)

| Módulo             | Entra                                                                                                                                                                  | Se aplaza                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Menú               | Categorías, productos, fotos, precio, disponibilidad, grupos de modificadores (mín./máx., obligatorios, con precio), combos como producto con grupos, botón de agotado | Inventario por insumo (recetas), menús por franja horaria                  |
| Plantillas         | 3 plantillas, colores, logo, tipografía y banner; modo carta QR y modo pedido                                                                                          | Editor de estructura libre                                                 |
| Pedido             | Link y QR, carrito con total en vivo, domicilio / recoger / mesa, dirección con pin + barrio + referencias, notas                                                      | Pedidos programados, dividir cuenta                                        |
| Pagos              | Wompi (Nequi, PSE, tarjeta, Bancolombia), efectivo y contraentrega                                                                                                     | Daviplata directo, Bre-B con conciliación propia, propinas digitales       |
| Operación          | Tablero en tiempo real con sonido, estados, vista de cocina simple, impresión de comanda                                                                               | Cocina por estación                                                        |
| WhatsApp           | Confirmación, cambio de estado y link de seguimiento (plantillas utility); respuesta automática con el link de la carta                                                | Bot con IA, campañas de marketing                                          |
| Domicilio          | Asignar domiciliario propio, web del domiciliario (lista, navegar, entregar con OTP), ubicación con la app abierta                                                     | Tracking en segundo plano (Capacitor), rutas, flota externa                |
| Sucursales y zonas | 1 a N sucursales, horarios, zonas con costo, mínimo y tiempo estimado                                                                                                  | Menú distinto por sucursal (en la v1 solo cambian precio y disponibilidad) |
| Roles              | Dueño, gerente, cajero, cocina, domiciliario                                                                                                                           | Soporte de la plataforma con suplantación auditada                         |
| Reportes           | Ventas, ticket promedio, top productos, horas pico, cancelaciones, "ahorro vs. agregador", CSV                                                                         | Cohortes, calificaciones, BI                                               |
| IA                 | Cargar el menú desde una foto de la carta (borrador editable en el panel)                                                                                              | Recomendaciones, ETA predictivo, bot de soporte                            |

> La foto de la carta es solo un atajo de carga para el restaurante. El cliente
> nunca ve esa foto: ve la carta web.

## V2 (días 90 a 180)

Fidelización (sellos o cashback), campañas de WhatsApp con opt-in, app del
domiciliario con Capacitor y tracking en segundo plano, flota externa por API,
menús por horario, inventario por insumo, calificaciones, multimarca para dark
kitchens.

## V3

Pedir y pagar en la mesa con cuenta dividida, integración con POS y facturación
electrónica (Siigo, Alegra), red compartida de domiciliarios, ETA predictivo,
asistente de WhatsApp con IA.
