import type { Category, Item } from '$lib/domain/menu';

import { describe, expect, it } from 'vitest';

import { normalizeSearch, popularItems, searchMenu } from '$lib/domain/menu-search';

function item(id: string, name: string, extra: Partial<Item> = {}): Item {
	return {
		id,
		name,
		description: null,
		price: 1000,
		imageUrl: null,
		available: true,
		tags: [],
		groups: [],
		suggestedItemIds: [],
		...extra
	};
}

const categories: Category[] = [
	{
		id: 'hamburguesas',
		name: 'Hamburguesas',
		items: [
			item('sencilla', 'Sencilla', { description: 'Carne de res y queso' }),
			item('costena', 'Costeña', { description: 'Con butifarra y suero', tags: ['popular'] })
		]
	},
	{
		id: 'acompanantes',
		name: 'Acompañantes',
		items: [
			item('patacon', 'Patacón', { tags: ['popular'], available: false }),
			item('butifarra', 'Butifarra (3 unidades)', { tags: ['popular'] })
		]
	}
];

describe('normalizeSearch', () => {
	it('quita tildes, mayúsculas y espacios de sobra', () => {
		expect(normalizeSearch('  PATACÓN   con  Queso ')).toBe('patacon con queso');
	});
});

describe('searchMenu', () => {
	it('encuentra sin importar tildes y mayúsculas', () => {
		const result = searchMenu(categories, 'COSTENA');

		expect(result.map((category) => category.items.map((i) => i.id))).toEqual([['costena']]);
	});

	it('busca también en la descripción y en todas las categorías', () => {
		const result = searchMenu(categories, 'butifarra');

		expect(result.flatMap((category) => category.items.map((i) => i.id))).toEqual([
			'costena',
			'butifarra'
		]);
	});

	it('exige todas las palabras', () => {
		expect(searchMenu(categories, 'carne suero')).toEqual([]);
	});

	it('sin búsqueda devuelve la carta completa', () => {
		expect(searchMenu(categories, '   ')).toEqual(categories);
	});
});

describe('popularItems', () => {
	it('trae los más pedidos con los disponibles primero', () => {
		expect(popularItems(categories).map((i) => i.id)).toEqual(['costena', 'butifarra', 'patacon']);
	});
});
