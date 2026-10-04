import type { Category, Item } from '$lib/domain/menu';

import { describe, expect, it } from 'vitest';

import {
	cartSuggestions,
	isQuickAdd,
	quickAddLine,
	suggestionsForItem
} from '$lib/domain/suggestions';

function item(id: string, extra: Partial<Item> = {}): Item {
	return {
		id,
		name: id,
		description: null,
		price: 5000,
		imageUrl: null,
		available: true,
		tags: [],
		groups: [],
		suggestedItemIds: [],
		...extra
	};
}

const requiredGroup = {
	id: 'preparacion',
	name: 'Preparación',
	min: 1,
	max: 1,
	modifiers: [{ id: 'agua', name: 'En agua', priceDelta: 0, available: true }]
};

const categories: Category[] = [
	{
		id: 'platos',
		name: 'Platos',
		items: [
			item('sencilla', { suggestedItemIds: ['patacon', 'kola', 'jugo'] }),
			item('punta', { suggestedItemIds: ['kola', 'yuca'] })
		]
	},
	{
		id: 'otros',
		name: 'Otros',
		items: [
			item('patacon'),
			item('kola'),
			item('yuca', { available: false }),
			item('jugo', { groups: [requiredGroup] })
		]
	}
];

const sencilla = categories[0]?.items[0] ?? item('x');

describe('isQuickAdd', () => {
	it('solo lo disponible y sin opciones obligatorias', () => {
		expect(isQuickAdd(item('a'))).toBe(true);
		expect(isQuickAdd(item('a', { available: false }))).toBe(false);
		expect(isQuickAdd(item('a', { groups: [requiredGroup] }))).toBe(false);
	});
});

describe('suggestionsForItem', () => {
	it('resuelve las sugerencias y descarta lo que no se agrega con un toque', () => {
		expect(suggestionsForItem(categories, sencilla).map((i) => i.id)).toEqual(['patacon', 'kola']);
	});
});

describe('cartSuggestions', () => {
	it('prioriza lo que más productos del pedido sugieren y omite lo que ya lleva', () => {
		const lines = [{ itemId: 'sencilla' }, { itemId: 'punta' }];

		// kola la sugieren los dos; patacón solo la sencilla; yuca está agotada.
		expect(cartSuggestions(categories, lines).map((i) => i.id)).toEqual(['kola', 'patacon']);
		expect(cartSuggestions(categories, [...lines, { itemId: 'kola' }]).map((i) => i.id)).toEqual([
			'patacon'
		]);
	});

	it('con el carrito vacío no sugiere nada', () => {
		expect(cartSuggestions(categories, [])).toEqual([]);
	});
});

describe('quickAddLine', () => {
	it('arma una línea sin opciones ni nota', () => {
		expect(quickAddLine(item('kola', { price: 4500 }))).toEqual({
			itemId: 'kola',
			modifierIds: [],
			note: '',
			qty: 1,
			preview: { name: 'kola', modifiersLabel: '', unitPrice: 4500, imageUrl: null }
		});
	});
});
