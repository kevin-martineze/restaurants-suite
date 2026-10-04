# Roles, permisos y flujos

Los permisos los decide la API. El frontend oculta lo que el rol no puede
hacer, pero la regla vive allá: un 403 llega con su mensaje.

| Rol                  | Alcance           | Puede                                                                                                 | No puede                                    |
| -------------------- | ----------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Dueño                | Todo el tenant    | Todo: plan, pagos, WhatsApp, roles, reportes                                                          | —                                           |
| Gerente de sucursal  | Sus sucursales    | Menú local (precios y agotados), personal, zonas, reportes de su sucursal                             | Facturación del plan, cuentas de pago       |
| Cajero               | Su sucursal       | Aceptar o rechazar, crear pedido manual, cobrar, asignar domiciliario                                 | Editar menú, ver reportes globales          |
| Cocina               | Su sucursal       | Ver la cocina, pasar a `preparing` o `ready`, marcar agotado                                          | Ver datos del cliente (solo nombre y notas) |
| Domiciliario         | Sus entregas      | Ver dirección y teléfono **solo de sus pedidos activos**, cambiar estados de entrega, cobrar efectivo | Ver historial de clientes                   |
| Soporte (plataforma) | Tenants asignados | Suplantación de solo lectura, con auditoría y aviso al dueño                                          | Cambiar pagos                               |
| Cliente              | Sus pedidos       | Pedir, seguir, reordenar, pedir que se borren sus datos                                               | —                                           |

## Flujo principal: domicilio

1. El cliente abre el link (QR, Instagram o WhatsApp).
2. Arma el carrito; la API cotiza y valida zona, horario y mínimo.
3. Paga con Wompi o elige efectivo.
4. El pedido entra como `received`; suena la alarma en el tablero y la tablet.
5. Si nadie lo acepta en 3 minutos, alerta al gerente y WhatsApp al dueño.
6. Al aceptarlo se imprime la comanda y el cliente recibe la confirmación con el
   tiempo estimado.
7. Cocina lo pasa a `ready`; el cajero asigna domiciliario.
8. `dispatched`: el cliente recibe el link de seguimiento.
9. El cliente dicta el código de 4 dígitos al recibir → `delivered`.
10. A los 30 minutos se le pide una calificación privada por WhatsApp.

Los estados exactos y sus transiciones están en
`../restaurants-api/docs/estados-del-pedido.md`.
