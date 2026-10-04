import { afterEach, describe, expect, it, vi } from 'vitest';

import { getMenu } from '$lib/server/api/menu';

const ctx = { slug: 'la-parrilla-de-tono', clientIp: '203.0.113.7' };

function respond(status: number, body: unknown) {
	const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify(body), { status }));

	vi.stubGlobal('fetch', fetchMock);

	return fetchMock;
}

const menu = {
	restaurant: {
		slug: 'la-parrilla-de-tono',
		name: 'La Parrilla de Toño',
		tagline: null,
		logoUrl: null,
		coverUrl: null,
		theme: { primary: '#c0392b', primaryForeground: '#ffffff' }
	},
	branch: {
		id: 'b1',
		name: 'Sede El Prado',
		address: 'El Prado, Barranquilla',
		etaMinutes: 35,
		fulfillment: ['delivery', 'pickup'],
		location: null
	},
	status: { open: true, label: 'Abierto · cierra a las 11:00 p. m.' },
	kitchen: { load: 'busy', label: 'Mucha demanda' },
	categories: []
};

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('getMenu', () => {
	it('pide la carta del slug con la IP del cliente', async () => {
		const fetchMock = respond(200, menu);
		const result = await getMenu(ctx);

		expect(result.ok).toBe(true);

		const [url, init] = fetchMock.mock.calls[0] ?? [];

		expect(String(url)).toMatch(/\/public\/la-parrilla-de-tono\/menu$/);
		expect(new Headers(init?.headers).get('x-forwarded-for')).toBe('203.0.113.7');
	});

	it('trae el error de la API en español', async () => {
		respond(404, { statusCode: 404, error: 'not_found', message: 'Este restaurante no existe.' });

		const result = await getMenu(ctx);

		expect(result).toMatchObject({ ok: false, status: 404, code: 'not_found' });
	});

	it('no deja pasar una respuesta con otra forma', async () => {
		respond(200, { ...menu, status: 'abierto' });

		expect(await getMenu(ctx)).toMatchObject({ ok: false, code: 'bad_response' });
	});
});
