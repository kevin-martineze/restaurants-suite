import { describe, expect, it } from 'vitest';

import { groupFormSchema, itemFormSchema } from '$lib/schemas/menu-admin';

const categoryId = 'a'.repeat(24);

describe('itemFormSchema', () => {
	it('lee el precio como lo escribe el dueño', () => {
		const item = itemFormSchema.parse({ categoryId, name: 'Sencilla', price: '$18.000' });

		expect(item).toMatchObject({ price: 18000, tags: [], description: '' });
	});

	it('pide precio y nombre', () => {
		const result = itemFormSchema.safeParse({ categoryId, name: ' ', price: '' });

		expect(result.success).toBe(false);
		if (result.success) return;

		expect(result.error.flatten().fieldErrors).toMatchObject({
			name: ['Ponle nombre al producto.'],
			price: ['Escribe el precio.']
		});
	});
});

describe('groupFormSchema', () => {
	it('lee las opciones que arma el editor', () => {
		const group = groupFormSchema.parse({
			name: 'Salsas',
			min: '0',
			max: '2',
			modifiers: JSON.stringify([
				{ id: null, name: 'Rosada', priceDelta: 0, available: true },
				{ id: 'b'.repeat(24), name: 'Piña', priceDelta: 500, available: false }
			])
		});

		expect(group.modifiers).toHaveLength(2);
		expect(group.max).toBe(2);
	});

	it('el mínimo no pasa del máximo', () => {
		const result = groupFormSchema.safeParse({
			name: 'Término',
			min: '2',
			max: '1',
			modifiers: JSON.stringify([{ id: null, name: 'Medio', priceDelta: 0, available: true }])
		});

		expect(result.success).toBe(false);
	});
});
