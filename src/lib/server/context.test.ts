import { describe, expect, it } from 'vitest';

import { safeRedirectTarget } from '$lib/server/context';

describe('safeRedirectTarget', () => {
	it('deja pasar rutas internas', () => {
		expect(safeRedirectTarget('/kitchen')).toBe('/kitchen');
	});

	it('ignora destinos fuera del sitio', () => {
		expect(safeRedirectTarget('https://malo.co')).toBe('/dashboard');
		expect(safeRedirectTarget('//malo.co')).toBe('/dashboard');
		expect(safeRedirectTarget('/\\\\malo.co')).toBe('/dashboard');
		expect(safeRedirectTarget(null)).toBe('/dashboard');
	});
});
