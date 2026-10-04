import type { Category, Item } from '$lib/domain/menu';

/**
 * Búsqueda dentro de la carta.
 *
 * Ignora tildes, mayúsculas y espacios de sobra: "costena" encuentra
 * "Costeña" y "PATACON" encuentra "Patacón". Busca en el nombre y la
 * descripción, y exige que aparezcan todas las palabras escritas.
 */

export function normalizeSearch(text: string): string {
	return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function matches(item: Item, words: string[]): boolean {
	const haystack = normalizeSearch(`${item.name} ${item.description ?? ''}`);

	return words.every((word) => haystack.includes(word));
}

/** Las categorías con solo los productos que coinciden; las vacías no salen. */
export function searchMenu(categories: readonly Category[], query: string): Category[] {
	const words = normalizeSearch(query).split(' ').filter(Boolean);

	if (words.length === 0) return [...categories];

	return categories
		.map((category) => ({
			...category,
			items: category.items.filter((item) => matches(item, words))
		}))
		.filter((category) => category.items.length > 0);
}

/** Los productos destacados como "Más pedido", disponibles primero. */
export function popularItems(categories: readonly Category[]): Item[] {
	return categories
		.flatMap((category) => category.items)
		.filter((item) => item.tags.includes('popular'))
		.sort((a, b) => Number(b.available) - Number(a.available));
}
