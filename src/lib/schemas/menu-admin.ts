import { z } from 'zod';

/** Formularios de la carta en el panel. Los mensajes son los que ve el dueño. */

const id = z.string().regex(/^[a-f0-9]{24}$/, 'Identificador inválido.');

/** "18.000", "$18000" o "18 000" → 18000. */
const pesos = (message: string) =>
	z
		.string()
		.trim()
		.transform((value, ctx) => {
			const digits = value.replace(/\D/g, '');

			if (digits === '') {
				ctx.addIssue({ code: z.ZodIssueCode.custom, message });

				return z.NEVER;
			}

			const amount = Number(digits);

			if (amount > 10_000_000) {
				ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ese precio no es válido.' });

				return z.NEVER;
			}

			return amount;
		});

export const categoryFormSchema = z.object({
	categoryId: id.optional(),
	name: z.string().trim().min(1, 'Ponle nombre a la categoría.').max(80, 'Máximo 80 caracteres.'),
	role: z.enum(['main', 'side', 'drink', 'dessert']).default('main')
});

export const itemFormSchema = z.object({
	itemId: id.optional(),
	categoryId: id,
	name: z.string().trim().min(1, 'Ponle nombre al producto.').max(120, 'Máximo 120 caracteres.'),
	description: z.string().trim().max(500, 'Máximo 500 caracteres.').default(''),
	price: pesos('Escribe el precio.'),
	tags: z.array(z.enum(['popular', 'new', 'spicy', 'vegetarian'])).default([]),
	modifierGroupIds: z.array(id).max(10).default([]),
	pairsWith: z.array(id).max(3, 'Elige máximo 3 sugerencias.').default([])
});

const modifierSchema = z.object({
	id: id.nullable(),
	name: z.string().trim().min(1, 'Cada opción necesita un nombre.').max(80),
	priceDelta: z.number().int().min(0).max(1_000_000),
	available: z.boolean()
});

export const groupFormSchema = z
	.object({
		groupId: id.optional(),
		name: z.string().trim().min(1, 'Ponle nombre al grupo.').max(80),
		min: z.coerce.number().int().min(0).max(20),
		max: z.coerce.number().int().min(1, 'El máximo es al menos 1.').max(20),
		modifiers: z
			.string()
			.transform((raw, ctx) => {
				try {
					return JSON.parse(raw);
				} catch {
					ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Opciones inválidas.' });

					return z.NEVER;
				}
			})
			.pipe(z.array(modifierSchema).min(1, 'Agrega al menos una opción.').max(30))
	})
	.refine((group) => group.min <= group.max, {
		message: 'El mínimo no puede ser mayor que el máximo.',
		path: ['min']
	});

export const availabilityFormSchema = z.object({
	itemId: id.optional(),
	groupId: id.optional(),
	modifierId: id.optional(),
	available: z.enum(['true', 'false']).transform((value) => value === 'true')
});

export const moveFormSchema = z.object({
	id,
	categoryId: id.optional(),
	direction: z.enum(['up', 'down']).transform((value) => (value === 'up' ? -1 : 1))
});
