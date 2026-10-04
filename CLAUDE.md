# CLAUDE.md — Reglas del proyecto

Léelo entero antes de generar código. Son las convenciones del proyecto, no
sugerencias. Cualquier desviación necesita justificación explícita y queda
anotada en `docs/decisiones.md`.

Producto: plataforma SaaS multitenant de pedidos y domicilios para restaurantes
en Colombia (piloto en Barranquilla). El nombre está pendiente: vive solo en
`$lib/brand.ts` (`PRODUCT_NAME`). Nunca lo escribas a mano en un componente.

Stack: **SvelteKit 2 + Svelte 5 (runes) + TypeScript strict + Tailwind v4 +
shadcn-svelte**, sobre la API propia `restaurants-api` (NestJS + MongoDB), en
`../restaurants-api`.

Documentación del producto: `docs/README.md`. Antes de construir una pantalla,
lee el documento de su rebanada.

---

## 1. Reglas duras

### TypeScript

1. **Prohibido `any`.** Usa `unknown` con type guards.
2. **Prohibido `as`.** Si necesitas castear, generaliza el tipo en su origen o
   escribe una guarda que lea campo a campo.
3. **Prohibido `@ts-ignore` / `@ts-expect-error`.**
4. **Prohibido `console.log`.** Solo `console.warn` / `console.error`, y nunca
   con datos de clientes (teléfono, dirección, nombre).

### Svelte 5

5. **Solo runes.** Cero `export let`, `$:`, `on:click`, `<slot>`. Usa `$state`,
   `$derived`, `$props`, `$effect`, `$bindable`, snippets y `{@render}`.
6. **`$derived` para todo cálculo derivado**, nunca `$effect` con `$state =`.
7. **`$effect` solo para efectos reales:** DOM, suscripciones (SSE), timers,
   hidratación de `localStorage`, wake-lock, sonido de alertas.
8. **Nada de subcomponentes declarados dentro de otro componente.**
9. **`{#each items as item (key)}` siempre con key.**
10. **Props con `interface Props` tipada.** Nunca se mutan: si necesitas estado
    local que parte de un prop, cópialo con `$state(untrack(() => …))`.

### Datos

11. **La carga inicial se hace en `+page.server.ts` / `+layout.server.ts`.** El
    cliente no hace `fetch` a la API. La única excepción es el canal de tiempo
    real (SSE) del tablero, la cocina y el seguimiento, que pasa por una ruta
    propia de SvelteKit, nunca directo a la API.
12. **Las mutaciones van por form actions** con `use:enhance`.
13. **El carrito vive en `localStorage`** y llega al servidor por form action,
    nunca por `fetch` manual.
14. **Errores en load: `error(status, mensaje)`** de `@sveltejs/kit`.
15. **Los precios los calcula siempre el servidor.** El navegador solo manda
    identificadores: producto, modificadores elegidos, nota y cantidad. El
    subtotal que pinta el carrito es orientativo; el que vale es la cotización.

### Datos: la API (`restaurants-api`)

16. **Todo dato del restaurante viene de la API, y solo desde el servidor**, a
    través de `$lib/server/api/`. Un archivo por superficie (`menu.ts`,
    `checkout.ts`, `orders.ts`, `panel-menu.ts`…).
17. **Nunca lanza: devuelve `ApiResult<T>`.** Se narrowa con `if (!result.ok)`;
    `result.message` ya viene en español, listo para mostrar.
18. **Toda respuesta se lee con zod y se traduce a `$lib/domain/*` dentro de
    `$lib/server/api/`.** Las páginas no conocen la forma de la API.
19. **Etapa de datos de prueba.** Mientras un módulo de la API no exista, su
    archivo en `$lib/server/api/` puede devolver datos de
    `$lib/server/fixtures/`. Reglas:
    - Las páginas **nunca** importan fixtures: solo `$lib/server/api/*`.
    - Cada función que devuelve fixtures lleva el comentario `// FIXTURE:` con
      el endpoint de la API que la reemplazará.
    - Los fixtures son de un restaurante real (carta, precios y adiciones de
      verdad), nunca "Producto 1".
    - Cambiar fixtures por la API no puede obligar a tocar ninguna página.
20. **Las reglas de precio viven en la API.** En la etapa de fixtures, la
    cotización corre en `$lib/server/api/` con la misma firma que tendrá el
    endpoint real.
21. **Toda form action del panel empieza validando la sesión y el rol**
    (cuando exista auth): las actions no ejecutan el `load` del layout.

### UI

22. **Los consumidores importan de `$lib/components/atoms/*`, nunca de
    `$lib/components/ui/*`.** Los átomos son el lugar de los overrides de marca.
    Si una primitiva no existe: `pnpm dlx shadcn-svelte@latest add <nombre>` y
    luego crea el átomo que la re-exporta.
23. **Atomic design:** `atoms → molecules → organisms`. Un componente solo
    importa de niveles inferiores.
24. **Solo tokens de Tailwind** (`bg-background`, `text-muted-foreground`,
    `text-caution`, `bg-whatsapp`…). Cero `bg-[#…]`, cero `text-[12px]`. Los
    colores del restaurante entran como variables CSS de su plantilla, no como
    clases arbitrarias.
25. **`cn()` para clases dinámicas.**
26. **Iconos: solo `@lucide/svelte`.** Cero emojis en la interfaz. Lucide no
    trae iconos de marca (no existe `instagram`).
27. **`type="button"` explícito** en todo botón que no sea submit.
28. **Los filtros, el orden y la paginación viven en `URLSearchParams`**, no en
    `$state`. La categoría activa de la carta es estado de scroll, no filtro.
29. **Mobile first.** La carta se diseña a 360 px de ancho y se prueba en un
    Android de gama media con 4G. Objetivo: menos de 150 KB de JS en la carta.

### Formularios

30. **Schemas zod en `$lib/schemas/`**, uno por dominio.
31. **Validación en el servidor siempre**, aunque el input tenga `required`.
32. **Botones de submit deshabilitados mientras se envía.**

### Imports

33. **Alias `$lib/`** para todo lo de `src/lib/`. Cero `../../`.
34. **Orden:** tipos → `svelte`/`@sveltejs/*` → librerías externas → `$app/*` →
    `$lib/*` → relativos. Línea en blanco entre grupos.

---

## 2. Textos de cara al público

Todo en español de Colombia, tuteando y sin tecnicismos. Los precios se muestran
con `formatMoney` (`$18.000`, sin decimales; ver `$lib/utils/money.ts`). Los
estados internos se guardan en inglés (`received`, `preparing`, `dispatched`) y
se traducen al pintarlos con un mapa de etiquetas en `$lib/domain/`.

---

## 3. Gates

`pnpm check`, `pnpm lint`, `pnpm format:check`, `pnpm test` y `pnpm build` deben
pasar. El pre-commit corre Prettier, ESLint y un grep que bloquea `console.log`,
`: any`, `as any`, `@ts-ignore`, `export let`, `on:click` y `$:`. Si falla, se
arregla la causa: nunca `--no-verify`.

Node: el proyecto corre en Node ≥ 20.19. Node 20 ya salió de soporte (abril de
2026): la migración a Node 22 está pendiente en `docs/decisiones.md`.

---

## 4. Antes de crear algo nuevo

1. Lee el documento de la rebanada en `docs/`.
2. Si existe un archivo equivalente en este repo, replica su patrón.
3. Si no existe, el referente es `../shopping-sas`, que sigue estas mismas
   reglas:
   - Carrito en `localStorage` → `src/lib/stores/cart.svelte.ts`
   - Página con form action → `src/routes/(shop)/carrito/+page.server.ts`
   - Cliente de la API → `src/lib/server/api/request.ts` y `storefront.ts`
   - Pantalla de administración → `src/routes/(admin)/admin/(panel)/cupones/`
