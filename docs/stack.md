# Stack

## Decidido

**Frontend** (`restaurants-suite`): carta web, panel, cocina y domiciliario.

- SvelteKit 2 + Svelte 5 (runes) + TypeScript strict
- Tailwind v4 + shadcn-svelte, iconos con `@lucide/svelte`
- zod para formularios y para leer la API
- Vitest (y Playwright cuando haya flujos que probar de punta a punta)
- ESLint, Prettier, Husky + lint-staged; pnpm
- Adaptador de Node

**Backend** (`restaurants-api`)

- NestJS + Fastify
- **MongoDB** con Mongoose (`@nestjs/mongoose`), siempre en replica set
- class-validator en los DTOs, zod para el entorno
- Swagger fuera de producción

**Integraciones**

- Wompi: Nequi, PSE, tarjeta, Bancolombia. Cuenta propia de cada restaurante.
- WhatsApp Cloud API de Meta, directa, con Embedded Signup.
- SDK de Anthropic para cargar el menú desde una foto.
- S3 o compatible (R2) para fotos.

**Infraestructura**

- Docker (o Podman) + Caddy, como en Globerce. Mongo administrado (Atlas) o
  propio en replica set.

## Lo que entra después, y cuándo

| Tecnología                                                    | Para qué                                                                  | Cuándo                                      |
| ------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------- |
| Índices `2dsphere` de Mongo                                   | Zonas de cobertura: "¿esta dirección cae en la zona?"                     | Rebanada 2                                  |
| Google Places (autocompletar) + Mapbox u OpenStreetMap (mapa) | Direcciones con pin                                                       | Rebanada 2                                  |
| Redis + BullMQ                                                | Colas de WhatsApp, reintentos, alertas de pedido sin aceptar              | Rebanada 3                                  |
| SSE (Server-Sent Events)                                      | Pedidos en el tablero sin recargar                                        | Rebanada 3                                  |
| Change streams de Mongo                                       | Disparar los eventos de tiempo real                                       | Rebanada 3                                  |
| WhatsApp Cloud API                                            | Confirmaciones y estados                                                  | Rebanada 5 (el trámite con Meta empieza ya) |
| Colecciones time series de Mongo con TTL                      | Ubicaciones del domiciliario, borradas a los 30 días                      | Rebanada 6                                  |
| Capacitor                                                     | App del domiciliario con ubicación en segundo plano; impresión en tablets | Después del piloto                          |

## Pendiente

- Impresora de comandas: tablet Sunmi con impresora integrada vs. Bluetooth
  ESC/POS. Se decide con los primeros restaurantes.
- Despliegue: lo actual alcanza para el piloto.
