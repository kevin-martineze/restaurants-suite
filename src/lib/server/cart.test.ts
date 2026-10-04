import { describe, expect, it } from 'vitest';

import { parseCartPayload } from '$lib/server/cart';

describe('parseCartPayload', () => {
	it('lee un carrito válido y normaliza la nota', () => {
		const raw = JSON.stringify([
			{ itemId: 'sencilla', modifierIds: ['medio'], note: '  sin   cebolla ', qty: 2 }
		]);

		expect(parseCartPayload(raw)).toEqual([
			{ itemId: 'sencilla', modifierIds: ['medio'], note: 'sin cebolla', qty: 2 }
		]);
	});

	it('descarta el carrito entero si algo no tiene la forma esperada', () => {
		const raw = JSON.stringify([
			{ itemId: 'sencilla', qty: 1 },
			{ itemId: 'doble', qty: 0 }
		]);

		expect(parseCartPayload(raw)).toEqual([]);
		expect(parseCartPayload('no es json')).toEqual([]);
		expect(parseCartPayload(null)).toEqual([]);
	});

	it('ignora un precio que mande el navegador', () => {
		const raw = JSON.stringify([{ itemId: 'sencilla', qty: 2, price: 1 }]);

		expect(parseCartPayload(raw)).toEqual([
			{ itemId: 'sencilla', modifierIds: [], note: '', qty: 2 }
		]);
	});
});
