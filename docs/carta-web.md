# Rebanada 1: carta web, hoja de opciones y carrito

## Qué es

Una **sola página** por restaurante (y sucursal) con sus categorías, productos y
precios, donde el cliente arma su carrito. No es una tienda con una página por
producto.

```
┌─────────────────────────────┐
│ [logo] Asados El Mono   ●Abierto │
│ Domicilio · Recoger   ~35 min    │
├─────────────────────────────┤
│ Hamburguesas | Perros | Asados | Bebidas →   ← pestañas fijas al hacer scroll
├─────────────────────────────┤
│ HAMBURGUESAS                     │
│ ┌──────────────────────[foto]┐  │
│ │ Sencilla          $18.000   │  │
│ │ Carne 150g, queso…          │  │
│ └─────────────────────────────┘  │
│ ┌──────────────────────[foto]┐  │
│ │ Doble (Agotado)             │  │
│ └─────────────────────────────┘  │
├─────────────────────────────┤
│  Ver carrito (3)      $52.000    │  ← barra fija abajo
└─────────────────────────────┘
```

Al tocar un producto se abre una **hoja desde abajo** con sus opciones:

```
Hamburguesa Sencilla      $18.000
Término de la carne (obligatorio, elige 1)
  ○ Medio  ● Tres cuartos  ○ Bien asada
Adiciones (opcional, hasta 3)
  ☑ Tocineta        +$3.000
  ☐ Queso extra     +$2.500
Salsas (elige hasta 2)
  ☑ Rosada  ☑ Piña  ☐ BBQ
Notas: [sin cebolla            ]
  [ − 1 + ]     Agregar  $21.000
```

## Comportamiento

- La pestaña activa sigue el scroll; tocar una pestaña desplaza a su sección.
  Es estado de scroll, no un filtro en la URL.
- El total de la hoja se recalcula con cada elección (orientativo).
- "Agregar" queda deshabilitado hasta cumplir los grupos obligatorios, y explica
  qué falta ("Elige el término de la carne").
- Un grupo con máximo alcanzado deshabilita las opciones restantes.
- Agotados: visibles pero apagados, con la etiqueta "Agotado". No se pueden abrir.
- Restaurante cerrado: la carta se ve, pero el carrito no deja pedir y muestra a
  qué hora abre.
- Carrito: cantidades editables, eliminar línea, notas visibles, subtotal.

## El carrito

Mismo principio que `shopping-sas` (`src/lib/stores/cart.svelte.ts`): vive en
`localStorage`, guarda solo identificadores y cantidades, y el precio lo calcula
el servidor.

La diferencia es la **línea**. En ropa era `variantId + qty`; en comida dos
hamburguesas iguales pero una con tocineta son **dos líneas distintas**:

```ts
interface MenuCartLine {
	/** itemId + modifierIds ordenados + nota normalizada. Misma clave, misma línea. */
	key: string;
	itemId: string;
	modifierIds: string[];
	note: string;
	qty: number;
	/** Solo para pintar sin ir al servidor; no es fuente de verdad. */
	preview: { name: string; modifiersLabel: string; unitPrice: number; imageUrl: string | null };
}
```

Agregar una línea con la misma `key` suma cantidad; con distinta `key`, crea
otra línea.

## Cotización

El carrito se manda por form action a `?/quote`. El servidor:

1. Valida que cada producto exista y esté disponible.
2. Valida cada grupo de modificadores (mínimo, máximo, obligatorio, que la
   opción pertenezca al grupo).
3. Calcula precio unitario (base + adiciones) y total.
4. Devuelve líneas válidas y líneas rechazadas con su motivo en español
   ("La Doble se agotó", "Elige máximo 2 salsas").

En la etapa de fixtures esto corre en `$lib/server/api/menu.ts`; después, en el
endpoint de la API con la misma firma.

## Dominio (paso 0)

En `$lib/domain/menu.ts`:

- `Menu`: restaurante, sucursal, abierto/cerrado, próxima apertura, categorías.
- `Category`: id, nombre, orden, productos.
- `Item`: id, nombre, descripción, precio base, foto, disponible, grupos.
- `ModifierGroup`: id, nombre, `min`, `max`, opciones. Obligatorio = `min ≥ 1`.
- `Modifier`: id, nombre, precio adicional (puede ser 0), disponible.

Precios en pesos enteros (COP no usa decimales).

## Cómo se valida

Con fixtures de un restaurante real, en un Android de gama media, con 3 a 5
personas: que armen un pedido con adiciones sin ayuda, y medir dónde dudan.
