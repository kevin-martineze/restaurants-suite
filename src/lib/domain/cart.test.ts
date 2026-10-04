import { describe, expect, it } from 'vitest';

import { clampQty, lineKey, MAX_NOTE_LENGTH, normalizeNote } from '$lib/domain/cart';

describe('lineKey', () => {
	it('no depende del orden en que se marcaron las opciones', () => {
		expect(lineKey('sencilla', ['tocineta', 'medio'], '')).toBe(
			lineKey('sencilla', ['medio', 'tocineta'], '')
		);
	});

	it('trata igual notas que solo cambian en espacios o mayúsculas', () => {
		expect(lineKey('sencilla', [], 'Sin  cebolla ')).toBe(lineKey('sencilla', [], 'sin cebolla'));
	});

	it('separa líneas con opciones o notas distintas', () => {
		const base = lineKey('sencilla', ['medio'], '');

		expect(lineKey('sencilla', ['medio', 'tocineta'], '')).not.toBe(base);
		expect(lineKey('sencilla', ['medio'], 'sin cebolla')).not.toBe(base);
		expect(lineKey('doble', ['medio'], '')).not.toBe(base);
	});
});

describe('normalizeNote', () => {
	it('recorta espacios y largo', () => {
		expect(normalizeNote('  sin   cebolla ')).toBe('sin cebolla');
		expect(normalizeNote('a'.repeat(500))).toHaveLength(MAX_NOTE_LENGTH);
	});
});

describe('clampQty', () => {
	it('mantiene la cantidad entre 1 y el máximo', () => {
		expect(clampQty(0)).toBe(1);
		expect(clampQty(3.7)).toBe(3);
		expect(clampQty(99)).toBe(20);
		expect(clampQty(Number.NaN)).toBe(1);
	});
});
