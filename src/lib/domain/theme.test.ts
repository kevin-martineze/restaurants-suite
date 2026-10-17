import { describe, expect, it } from 'vitest';

import { isSafeColor, primaryForeground, themeStyle } from '$lib/domain/theme';

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

describe('primaryForeground', () => {
	it('un color oscuro pide texto blanco y uno claro pide texto casi negro', () => {
		expect(primaryForeground('#111111')).toBe('oklch(1 0 0)');
		expect(primaryForeground('#ffffff')).toBe('oklch(0.2 0 0)');
		expect(primaryForeground('#c0392b')).toBe('oklch(1 0 0)');
	});

	it('acepta hex corto y cae al blanco si no entiende el color', () => {
		expect(primaryForeground('#000')).toBe('oklch(1 0 0)');
		expect(primaryForeground('oklch(0.52 0.19 33)')).toBe('oklch(1 0 0)');
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
