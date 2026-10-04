import { describe, expect, it } from 'vitest';

import { cashSuggestions, changeFor } from '$lib/domain/checkout';

describe('cashSuggestions', () => {
	it('sugiere los billetes redondos por encima del total', () => {
		expect(cashSuggestions(39000)).toEqual([40000, 50000, 100000]);
		expect(cashSuggestions(42500)).toEqual([50000, 60000, 100000]);
	});

	it('si el total ya es redondo no lo repite', () => {
		expect(cashSuggestions(50000)).toEqual([60000, 100000]);
	});
});

describe('changeFor', () => {
	it('calcula el cambio y nunca da negativo', () => {
		expect(changeFor(39000, 50000)).toBe(11000);
		expect(changeFor(39000, null)).toBe(0);
		expect(changeFor(39000, 20000)).toBe(0);
	});
});
