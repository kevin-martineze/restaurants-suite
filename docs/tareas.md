# Plan de trabajo y tareas

Plan completo del MVP, en el orden en que se construye. Cada tarea indica el
repo: **[web]** `restaurants-suite`, **[api]** `restaurants-api`, **[negocio]**
fuera del código. Se marca `[x]` al terminar, con el commit cuando aplica.

Las reglas del ciclo están en [roadmap.md](roadmap.md): UI con fixtures →
validar con gente real → API → conectar. El precio siempre lo calcula el
servidor.

Convención de URLs del cliente: la carta vive en `/{slug}` (por ejemplo
`/asados-el-mono`). Los subdominios por restaurante quedan para después. Las
rutas del equipo (`/panel`, `/cocina`, `/domicilios`, `/plataforma`, `/entrar`)
son palabras reservadas que ningún restaurante puede usar como slug.

---

## Fase 0 — Fundaciones

- [x] [web] Proyecto SvelteKit 2 con reglas, lint, pre-commit y documentación (`0d86cd5`)
- [x] [api] Proyecto NestJS + Fastify + MongoDB con salud y Swagger (`2098bea`)
- [x] [web] Plan de trabajo y tareas (este archivo)
- [ ] [negocio] Decidir el nombre del producto
- [ ] [negocio] Conseguir la carta real de un restaurante piloto
- [ ] [negocio] Arrancar el trámite de Meta Business / Tech Provider (tarda semanas)
- [ ] [negocio] Migrar la máquina de desarrollo a Node 22

## Fase 1 — Carta web, hoja de opciones y carrito

Documento: [carta-web.md](carta-web.md).

### Paso 0: el contrato

- [x] [web] Tipos del dominio del menú en `$lib/domain/menu.ts` (`Menu`, `Category`, `Item`, `ModifierGroup`, `Modifier`)
- [x] [web] Reglas puras de selección de modificadores (validar mín./máx., precio unitario) con pruebas
- [x] [web] Línea del carrito y su clave (`itemId` + modificadores + nota) con pruebas
- [x] [web] Fixtures de un restaurante de Barranquilla (ficticio hasta tener uno real)

### UI con fixtures

- [x] [web] Cliente de la API (`ApiResult`, `apiRequest`) y entorno del servidor
- [x] [web] `$lib/server/api/menu.ts`: `getMenu(slug)` y `quoteCart(slug, lines)` sobre fixtures (`// FIXTURE:`)
- [x] [web] Átomos de shadcn necesarios (sheet/drawer, badge, checkbox, radio, textarea, separator)
- [x] [web] Ruta `/[slug]`: encabezado del restaurante (logo, abierto/cerrado, tiempo estimado)
- [x] [web] Pestañas de categorías fijas que siguen el scroll
- [x] [web] Tarjeta de producto (foto, precio, agotado)
- [x] [web] Hoja de opciones: grupos, mín./máx., total en vivo, notas, cantidad, "Agregar" con motivo cuando falta algo
- [x] [web] Store del carrito en `localStorage` con líneas por clave
- [x] [web] Barra fija "Ver carrito" y hoja del carrito (editar cantidades, quitar, subtotal)
- [x] [web] Form action `?/quote`: cotización del servidor con líneas rechazadas y su motivo
- [x] [web] Restaurante cerrado: carta visible, pedido bloqueado, hora de apertura
- [x] [web] Plantilla del restaurante: colores como variables CSS sobre los tokens
- [x] [web] Revisión en 360 px y presupuesto de JS de la carta (77 KB de JS transferidos)
- [x] [web] Rediseño en galería de fotos, con versión para computador (carrito lateral)
- [x] [web] Diseño diferenciador: portada inmersiva, "Lo más pedido", etiquetas, cantidad en el carrito sobre cada producto, buscador en la carta
- [x] [api] Etiquetas de producto (`popular`, `new`, `spicy`, `vegetarian`) y foto de portada de la marca
- [x] [api+web] "Combina con…" en la hoja del producto y "¿Le sumas algo?" en el carrito (sugerencias por papel de categoría o elegidas a mano)
- [ ] [negocio] Probar la carta con 3 a 5 personas en un Android de gama media

### API del menú

- [x] [api] Capa de tenancy: repositorio base que siempre filtra por `tenantId`, con prueba de aislamiento
- [x] [api] Esquemas: `tenants`, `brands`, `branches`, `categories`, `items`, `modifierGroups`, `branchItems`
- [x] [api] `menuSnapshots`: generación del menú publicado por sucursal
- [x] [api] `GET /public/:slug/menu`
- [x] [api] Función de precio compartida (cotización y pedido) con pruebas
- [x] [api] `POST /public/:slug/quote` con errores en español por línea
- [x] [api] Script de semilla con el restaurante de los fixtures
- [x] [web] Cambiar fixtures por la API sin tocar páginas

## Fase 2 — Checkout

- [ ] [web] Página de checkout: tipo de entrega (domicilio, recoger, mesa)
- [ ] [web] Dirección: autocompletar + pin en el mapa + barrio + referencias
- [ ] [web] Datos del cliente (nombre, teléfono) con consentimiento separado (servicio / marketing)
- [ ] [api] Zonas de cobertura con polígonos `2dsphere`: costo, mínimo, tiempo estimado
- [ ] [api] Horarios de la sucursal en `America/Bogota` y estado abierto/pausado
- [ ] [api] `customers` por tenant con direcciones embebidas
- [ ] [api] `POST /public/:slug/orders` en transacción: consecutivo, snapshots, evento inicial, idempotencia
- [ ] [api] Wompi: cuenta por restaurante (llaves cifradas), creación del pago, webhook con firma e idempotencia
- [ ] [web] Pago: Wompi (Nequi, PSE, tarjeta, Bancolombia), efectivo y contraentrega
- [ ] [web] Página de confirmación y seguimiento básico del pedido

## Fase 3 — Equipo: acceso, tablero y cocina

- [ ] [api] Usuarios, sesiones (JWT + refresh) y membresías con rol y sucursales
- [ ] [web] Entrar / salir, sesión cifrada en cookie, guardas por rol
- [ ] [api] Máquina de estados del pedido en una sola función, con pruebas de cada transición
- [ ] [api] `PATCH` de estado con evento (actor, hora, motivo)
- [ ] [api] Eventos en tiempo real (change streams / Redis pub/sub)
- [ ] [web] Ruta SSE propia y tablero del cajero con sonido y wake-lock
- [ ] [web] Vista de cocina: tarjetas por estado, marcar agotado
- [ ] [api] Redis + BullMQ: alerta de pedido sin aceptar a los 3 minutos
- [ ] [web] Crear pedido manual (teléfono o mostrador)
- [ ] [web] Impresión de comanda (decidir: Sunmi vs. Bluetooth ESC/POS)

## Fase 4 — Panel del restaurante

- [ ] [web] Menú: categorías, productos, fotos, grupos de modificadores, agotados
- [ ] [api] Subida de fotos a S3/R2
- [ ] [api] Carga del menú desde una foto de la carta (IA) como borrador editable
- [ ] [web] Sucursales, horarios y zonas (dibujar el polígono)
- [ ] [web] Plantillas: 3 diseños, colores, logo, tipografía, banner
- [ ] [web] Equipo: invitar y asignar roles
- [ ] [web] QR de la carta y de cada mesa para imprimir

## Fase 5 — WhatsApp y seguimiento

- [ ] [api] Embedded Signup: conectar el número de cada restaurante (token cifrado)
- [ ] [api] Webhook de mensajes: responder con el link mágico de la carta
- [ ] [api] Plantillas utility: confirmación y cambio de estado, por cola, con registro
- [ ] [web] Link mágico: teléfono firmado, dirección prellenada, sin login
- [ ] [web] Página de seguimiento en vivo
- [ ] [web] Reordenar un pedido anterior

## Fase 6 — Domiciliario

- [ ] [web] Web del domiciliario: pedidos asignados, navegar, llamar
- [ ] [api] Asignación de domiciliario y estados de entrega
- [ ] [api] Código OTP de entrega
- [ ] [api] Ubicaciones en colección time series con TTL de 30 días
- [ ] [web] Liquidación de efectivo del turno

## Fase 7 — Reportes y cobro

- [ ] [api] Agregaciones: ventas, ticket promedio, top productos, horas pico, cancelaciones
- [ ] [web] Panel de reportes con "ahorro vs. agregador" y exportar CSV
- [ ] [api] Planes y cobro recurrente (adaptar `billing` de `ecommerce-api`)
- [ ] [web] Registro y onboarding autoservicio

## Fase 8 — Lanzamiento del piloto

- [ ] [api] Sentry, monitor de disponibilidad y respaldos diarios de Mongo
- [ ] [api] Prueba de carga de hora pico
- [ ] [negocio] Política de tratamiento de datos, contrato de encargado y términos
- [ ] [negocio] 5 restaurantes piloto en vivo
- [ ] [negocio] Lanzamiento público en Barranquilla
