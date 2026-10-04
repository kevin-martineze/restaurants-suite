import type { CartLine } from '$lib/domain/cart';
import type { Category, Item } from '$lib/domain/menu';

/**
 * "Combina con…" y "¿Le sumas algo?".
 *
 * La API decide qué combina con qué; aquí solo se resuelven los ids contra la
 * carta y se filtra lo que ya no se puede agregar con un toque (se agotó o
 * ahora pide elegir una opción).
 */

/** Se agrega con un toque: disponible y sin opciones obligatorias. */
export function isQuickAdd(item: Item): boolean {
	return item.available && item.groups.every((group) => group.min === 0);
}

function itemIndex(categories: readonly Category[]): Map<string, Item> {
	return new Map(categories.flatMap((category) => category.items.map((item) => [item.id, item])));
}

/** Lo que combina con un producto, listo para agregar con un toque. */
export function suggestionsForItem(categories: readonly Category[], item: Item): Item[] {
	const index = itemIndex(categories);

	return item.suggestedItemIds.flatMap((id) => {
		const candidate = index.get(id);

		return candidate && isQuickAdd(candidate) ? [candidate] : [];
	});
}

/**
 * Lo que le falta al pedido: las sugerencias de lo que ya lleva, sin repetir
 * lo que ya está en el carrito. Primero lo que más productos del pedido
 * sugieren.
 */
export function cartSuggestions(
	categories: readonly Category[],
	lines: readonly Pick<CartLine, 'itemId'>[],
	max = 4
): Item[] {
	const index = itemIndex(categories);
	const inCart = new Set(lines.map((line) => line.itemId));
	const votes = new Map<string, number>();

	for (const itemId of inCart) {
		for (const id of index.get(itemId)?.suggestedItemIds ?? []) {
			if (!inCart.has(id)) votes.set(id, (votes.get(id) ?? 0) + 1);
		}
	}

	return [...votes.entries()]
		.sort((a, b) => b[1] - a[1])
		.flatMap(([id]) => {
			const candidate = index.get(id);

			return candidate && isQuickAdd(candidate) ? [candidate] : [];
		})
		.slice(0, max);
}

/** La línea de carrito de un producto agregado con un toque. */
export function quickAddLine(item: Item): Omit<CartLine, 'key'> {
	return {
		itemId: item.id,
		modifierIds: [],
		note: '',
		qty: 1,
		preview: { name: item.name, modifiersLabel: '', unitPrice: item.price, imageUrl: item.imageUrl }
	};
}
