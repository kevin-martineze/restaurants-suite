# Registro de decisiones

Cada decisión con su fecha, qué se decidió y por qué. Si se revierte, se agrega
una entrada nueva; no se borra la anterior.

## 2026-10-03 — Dos proyectos nuevos, no una vertical dentro de Globerce

`restaurants-suite` y `restaurants-api`, separados de `shopping-sas` y
`ecommerce-api`. La experiencia de la carta (una sola página, hoja de opciones,
horarios, zonas) es muy distinta a la de la tienda de ropa, y mezclarlas
complicaría las dos. Auth, Wompi y el cobro de planes se copian y adaptan desde
`ecommerce-api`; no se comparten.

## 2026-10-03 — MongoDB en la API

Decisión del equipo. Encaja con el menú (producto + grupos + opciones en un
documento) y el pedido (líneas y precios congelados en un documento), trae
geolocalización (`2dsphere`) y time series. Consecuencias:

- No se reutiliza la base ni los módulos Prisma de `ecommerce-api`.
- Sin RLS: el aislamiento entre tenants vive en una capa de repositorio que
  siempre filtra por `tenantId` (ver `../restaurants-api/CLAUDE.md`).
- Replica set obligatorio, también en local, por transacciones y change streams.
- Mongoose en vez de Prisma: el soporte de Prisma para Mongo es más limitado.

## 2026-10-03 — SvelteKit 2, no 3

El instalador ya trae SvelteKit 3, pero lo pactado (y lo que usa
`shopping-sas`) es SvelteKit 2. Además SvelteKit 3 exige Node ≥ 22.17 y la
máquina de desarrollo tiene Node 20. Migrar a 3 es una decisión aparte, cuando
haya motivo.

## 2026-10-03 — Node 20 por ahora (pendiente: Node 22)

La máquina tiene Node 20.20, ya fuera de soporte. Los proyectos piden
`>=20.19`. Por eso `lint-staged` va en la 16 (la 17 exige Node 22). Al pasar a
Node 22: subir `engines`, `lint-staged` y `@types/node`.

## 2026-10-03 — Construir por rebanadas

Cada flujo: UI con fixtures → validar con gente real → API → conectar. Ver
[roadmap.md](roadmap.md).

## 2026-10-03 — El precio lo calcula el servidor, siempre

El navegador manda identificadores y cantidades. Ni con fixtures se suma en el
cliente.

## 2026-10-03 — El dinero va directo al restaurante

Cada restaurante conecta su propia cuenta Wompi. No cobramos porcentaje sobre
pagos: evita volvernos agregador de pagos y protege el mensaje de 0% comisión.

## 2026-10-03 — WhatsApp con la Cloud API de Meta, directa

Con Embedded Signup, cada restaurante conecta su propio número. Un BSP
(360dialog) solo si el trámite con Meta nos frena.

## 2026-10-03 — Domiciliario: web primero, Capacitor después

Una web no envía ubicación con la pantalla bloqueada. La v1 promete eventos con
hora y ubicación con la app abierta; Capacitor sobre la misma web en la v2.

## 2026-10-03 — La carta vive en `/{slug}`

Por ruta y no por subdominio: es más simple de desplegar y de compartir en
WhatsApp. Las rutas del equipo (`/panel`, `/cocina`, `/domicilios`,
`/plataforma`, `/entrar`) quedan reservadas: ningún restaurante puede usarlas
como slug. Los subdominios quedan para después.

## 2026-10-03 — Opciones de la carta con inputs nativos

La hoja de opciones usa `<input type="radio">` y `checkbox` nativos con
estilo propio, no las primitivas de bits-ui: pesan menos JS en la carta, que
es lo que abre el cliente con 4G, y son accesibles de fábrica. Radio solo
cuando el grupo es obligatorio de una opción; un grupo opcional de una opción
usa casilla para poder desmarcarla.

## 2026-10-03 — Los colores del restaurante entran como variables CSS

La plantilla pisa `--primary` y `--primary-foreground` con un `style` en la
carta y en las hojas (que se pintan fuera de su árbol). El color se valida
(hex u `oklch`) antes de llegar al atributo, para no inyectar CSS.

## 2026-10-04 — La carta es una galería de fotos

La comida manda: fotos cuadradas en 2 columnas en el celular y 3 en pantallas
grandes. En computador la carta usa todo el ancho, el carrito es una columna
fija y las opciones salen desde el costado. Elegido por el equipo frente a
"app de domicilios", "carta impresa" y "moderna llamativa".

## 2026-10-04 — Lo que hace distinta a la carta

Para no parecerse a lo que ya existe:

- Portada inmersiva con el nombre sobre la foto y datos en cápsulas de vidrio.
- Tipografía de títulos propia (Bricolage Grotesque) e Inter para el cuerpo,
  servidas desde el sitio.
- "Lo más pedido": carrusel con ranking, alimentado por la etiqueta `popular`.
- Etiquetas que pone el restaurante: Más pedido, Nuevo, Picante, Vegetariano.
- Cada producto muestra cuántas unidades llevas; la barra del carrito rebota y
  el celular vibra al agregar.
- Buscador dentro de la carta que ignora tildes. La búsqueda vive en la URL
  (`?q=`), así se puede compartir.

Peso de la carta: 81 KB de JS, 88 KB de tipografías, 10 KB de CSS. Las fotos
de prueba se piden a 500 px; las reales las achicará la API (fase 4).

## 2026-10-04 — Venta cruzada: "Combina con…" y "¿Le sumas algo?"

Para subir el ticket promedio sin descuentos:

- Cada categoría tiene un papel: principal, acompañante, bebida o postre.
- La API calcula al publicar el menú hasta 3 sugerencias por producto: las que
  el restaurante eligió a mano (`pairsWith`) o, si no eligió, acompañantes y
  bebidas intercalados, con los más pedidos primero. Solo a platos principales.
- Solo se sugiere lo que se agrega con un toque (disponible y sin opciones
  obligatorias): sugerir algo que abre otra hoja corta la compra.
- La carta las muestra en la hoja del producto y en el carrito; en el carrito
  se priorizan las que más productos del pedido sugieren.

Pendiente para cuando haya pedidos: medir cuántas sugerencias se aceptan.
