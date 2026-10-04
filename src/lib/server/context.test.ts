import { describe, expect, it } from 'vitest';

import { safeRedirectTarget } from '$lib/server/context';

describe('safeRedirectTarget', () => {
	it('deja pasar rutas internas', () => {
		expect(safeRedirectTarget('/cocina')).toBe('/cocina');
	});

	it('ignora destinos fuera del sitio', () => {
		expect(safeRedirectTarget('https://malo.co')).toBe('/panel');
		expect(safeRedirectTarget('//malo.co')).toBe('/panel');
		expect(safeRedirectTarget('/\\\\malo.co')).toBe('/panel');
		expect(safeRedirectTarget(null)).toBe('/panel');
	});
});
