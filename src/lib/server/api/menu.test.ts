import { describe, expect, it } from 'vitest';

import { getMenu, quoteCart } from '$lib/server/api/menu';

const ctx = { slug: 'la-parrilla-de-tono', clientIp: null };

describe('getMenu', () => {
	it('devuelve la carta del restaurante con su estado', async () => {
		const result = await getMenu(ctx, new Date('2026-10-05T13:00:00-05:00'));

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.data.restaurant.name).toBe('La Parrilla de Toño');
		expect(result.data.status.open).toBe(true);
	});

	it('responde 404 para un restaurante que no existe', async () => {
		const result = await getMenu({ slug: 'otro', clientIp: null });

		expect(result.ok).toBe(false);
		if (result.ok) return;

		expect(result.status).toBe(404);
	});
});

describe('quoteCart', () => {
	it('cotiza con los precios del servidor', async () => {
		const result = await quoteCart(ctx, [
			{
				itemId: 'hamburguesa-sencilla',
				modifierIds: ['termino-medio', 'adicion-tocineta'],
				note: 'sin cebolla',
				qty: 2
			},
			{ itemId: 'agua', modifierIds: [], note: '', qty: 1 }
		]);

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.data.rejected).toEqual([]);
		expect(result.data.lines.map((line) => line.total)).toEqual([42000, 3000]);
		expect(result.data.subtotal).toBe(45000);
		expect(result.data.lines[0]?.modifiersLabel).toBe('Medio · Tocineta');
	});

	it('rechaza líneas con su motivo y cotiza el resto', async () => {
		const result = await quoteCart(ctx, [
			{ itemId: 'hamburguesa-doble', modifierIds: ['termino-medio'], note: '', qty: 1 },
			{ itemId: 'punta-de-anca', modifierIds: ['termino-medio'], note: '', qty: 1 },
			{ itemId: 'no-existe', modifierIds: [], note: '', qty: 1 },
			{ itemId: 'patacon', modifierIds: [], note: '', qty: 3 }
		]);

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.data.rejected.map((line) => line.reason)).toEqual([
			'«Doble» se agotó.',
			'Elige al menos 2 en «Acompañantes».',
			'Este producto ya no está en la carta.'
		]);
		expect(result.data.subtotal).toBe(18000);
	});
});
