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
