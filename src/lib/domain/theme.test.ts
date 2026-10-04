import { describe, expect, it } from 'vitest';

import { isSafeColor, themeStyle } from '$lib/domain/theme';

describe('isSafeColor', () => {
	it('acepta hex y oklch', () => {
		expect(isSafeColor('#c0392b')).toBe(true);
		expect(isSafeColor('oklch(0.52 0.19 33)')).toBe(true);
		expect(isSafeColor('oklch(52% 0.19 33 / 0.9)')).toBe(true);
	});

	it('rechaza lo que podría inyectar CSS', () => {
		expect(isSafeColor('red; background: url(x)')).toBe(false);
		expect(isSafeColor('oklch(0.5 0.1 30); --x: 1')).toBe(false);
		expect(isSafeColor('')).toBe(false);
	});
});

describe('themeStyle', () => {
	it('arma las variables de la plantilla', () => {
		expect(themeStyle({ primary: '#c0392b', primaryForeground: '#ffffff' })).toBe(
			'--primary: #c0392b; --ring: #c0392b; --primary-foreground: #ffffff'
		);
	});

	it('omite los colores inválidos', () => {
		expect(themeStyle({ primary: 'url(x)', primaryForeground: '#fff' })).toBe(
			'--primary-foreground: #fff'
		);
	});
});
