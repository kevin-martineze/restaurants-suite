import { describe, expect, it } from 'vitest';

import { groupSummary, moveId, productsLabel } from '$lib/domain/menu-admin';

describe('groupSummary', () => {
	it('dice la regla del grupo', () => {
		expect(groupSummary({ min: 1, max: 1 })).toBe('Obligatorio · 1');
		expect(groupSummary({ min: 0, max: 3 })).toBe('Opcional · hasta 3');
		expect(groupSummary({ min: 1, max: 2 })).toBe('Obligatorio · 1 a 2');
		expect(groupSummary({ min: 0, max: 1 })).toBe('Opcional · 1');
	});
});

describe('moveId', () => {
	it('sube y baja sin salirse de la lista', () => {
		expect(moveId(['a', 'b', 'c'], 'b', -1)).toEqual(['b', 'a', 'c']);
		expect(moveId(['a', 'b', 'c'], 'b', 1)).toEqual(['a', 'c', 'b']);
		expect(moveId(['a', 'b', 'c'], 'a', -1)).toEqual(['a', 'b', 'c']);
		expect(moveId(['a', 'b', 'c'], 'x', 1)).toEqual(['a', 'b', 'c']);
	});
});

describe('productsLabel', () => {
	it('singular y plural', () => {
		expect(productsLabel(1)).toBe('1 producto');
		expect(productsLabel(3)).toBe('3 productos');
	});
});
