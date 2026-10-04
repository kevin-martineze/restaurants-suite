import type { Item, ModifierGroup } from '$lib/domain/menu';

import { describe, expect, it } from 'vitest';

import {
	groupRuleLabel,
	selectionLabel,
	selectionProblems,
	toggleModifier,
	unitPrice
} from '$lib/domain/menu-selection';

const termino: ModifierGroup = {
	id: 'termino',
	name: 'Término de la carne',
	min: 1,
	max: 1,
	modifiers: [
		{ id: 'medio', name: 'Medio', priceDelta: 0, available: true },
		{ id: 'tres-cuartos', name: 'Tres cuartos', priceDelta: 0, available: true }
	]
};

const adiciones: ModifierGroup = {
	id: 'adiciones',
	name: 'Adiciones',
	min: 0,
	max: 2,
	modifiers: [
		{ id: 'tocineta', name: 'Tocineta', priceDelta: 3000, available: true },
		{ id: 'queso', name: 'Queso extra', priceDelta: 2500, available: true },
		{ id: 'huevo', name: 'Huevo', priceDelta: 2000, available: false }
	]
};

const hamburguesa: Item = {
	id: 'sencilla',
	name: 'Hamburguesa sencilla',
	description: null,
	price: 18000,
	imageUrl: null,
	available: true,
	groups: [termino, adiciones]
};

describe('groupRuleLabel', () => {
	it('describe grupos obligatorios y opcionales', () => {
		expect(groupRuleLabel(termino)).toBe('Obligatorio · elige 1');
		expect(groupRuleLabel(adiciones)).toBe('Opcional · hasta 2');
		expect(groupRuleLabel({ ...adiciones, min: 1, max: 3 })).toBe(
			'Obligatorio · elige entre 1 y 3'
		);
		expect(groupRuleLabel({ ...adiciones, min: 0, max: 1 })).toBe('Opcional');
	});
});

describe('toggleModifier', () => {
	it('en un grupo de una opción, elegir otra reemplaza la anterior', () => {
		const first = toggleModifier([], termino, 'medio');

		expect(toggleModifier(first, termino, 'tres-cuartos')).toEqual(['tres-cuartos']);
	});

	it('un obligatorio de una opción no se desmarca tocándolo', () => {
		expect(toggleModifier(['medio'], termino, 'medio')).toEqual(['medio']);
	});

	it('no pasa del máximo del grupo', () => {
		const two = toggleModifier(toggleModifier([], adiciones, 'tocineta'), adiciones, 'queso');

		expect(toggleModifier(two, adiciones, 'huevo')).toEqual(['tocineta', 'queso']);
	});

	it('desmarca en un grupo de varias opciones', () => {
		expect(toggleModifier(['tocineta', 'queso'], adiciones, 'tocineta')).toEqual(['queso']);
	});

	it('ignora opciones de otro grupo', () => {
		expect(toggleModifier([], termino, 'tocineta')).toEqual([]);
	});

	it('no toca la selección de otros grupos', () => {
		expect(toggleModifier(['tocineta'], termino, 'medio')).toEqual(['tocineta', 'medio']);
	});
});

describe('selectionProblems', () => {
	it('acepta una selección completa', () => {
		expect(selectionProblems(hamburguesa, ['medio', 'tocineta'])).toEqual([]);
	});

	it('pide lo obligatorio que falta', () => {
		expect(selectionProblems(hamburguesa, [])).toEqual([
			'Elige una opción en «Término de la carne».'
		]);
	});

	it('rechaza pasar del máximo', () => {
		const tres = { ...adiciones, max: 1 };

		expect(
			selectionProblems({ ...hamburguesa, groups: [termino, tres] }, ['medio', 'tocineta', 'queso'])
		).toEqual(['Elige máximo 1 en «Adiciones».']);
	});

	it('rechaza opciones agotadas, desconocidas o repetidas', () => {
		expect(selectionProblems(hamburguesa, ['medio', 'huevo'])).toEqual(['«Huevo» se agotó.']);
		expect(selectionProblems(hamburguesa, ['medio', 'piña'])).toEqual([
			'Una de las opciones de «Hamburguesa sencilla» ya no existe.'
		]);
		expect(selectionProblems(hamburguesa, ['medio', 'tocineta', 'tocineta'])).toContain(
			'Una opción de «Hamburguesa sencilla» viene repetida.'
		);
	});

	it('rechaza un producto agotado', () => {
		expect(selectionProblems({ ...hamburguesa, available: false }, ['medio'])).toEqual([
			'«Hamburguesa sencilla» se agotó.'
		]);
	});
});

describe('unitPrice', () => {
	it('suma las adiciones al precio base', () => {
		expect(unitPrice(hamburguesa, ['medio'])).toBe(18000);
		expect(unitPrice(hamburguesa, ['medio', 'tocineta', 'queso'])).toBe(23500);
	});
});

describe('selectionLabel', () => {
	it('lista las opciones en el orden de los grupos', () => {
		expect(selectionLabel(hamburguesa, ['queso', 'tres-cuartos'])).toBe(
			'Tres cuartos · Queso extra'
		);
	});
});
