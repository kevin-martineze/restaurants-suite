import type { CartRequestLine } from '$lib/domain/cart';

import { z } from 'zod';

import { MAX_NOTE_LENGTH, MAX_QTY_PER_LINE, normalizeNote } from '$lib/domain/cart';

/** Un carrito más grande que esto no es un cliente: es alguien probando la API. */
const MAX_LINES = 50;
const MAX_MODIFIERS_PER_LINE = 20;

const lineSchema = z.object({
	itemId: z.string().min(1).max(64),
	modifierIds: z.array(z.string().min(1).max(64)).max(MAX_MODIFIERS_PER_LINE).default([]),
	note: z
		.string()
		.max(MAX_NOTE_LENGTH * 2)
		.default(''),
	qty: z.number().int().min(1).max(MAX_QTY_PER_LINE)
});

const payloadSchema = z.array(lineSchema).max(MAX_LINES);

/**
 * Lee el carrito que llega en una form action.
 *
 * Lo que no tenga la forma esperada se descarta entero: el carrito lo arma
 * nuestro propio código, así que algo malformado es un carrito viejo o
 * manipulado, y cotizar media lista sería peor que no cotizar.
 */
export function parseCartPayload(raw: FormDataEntryValue | null): CartRequestLine[] {
	if (typeof raw !== 'string' || raw === '') return [];

	let json: unknown;

	try {
		json = JSON.parse(raw);
	} catch {
		return [];
	}

	const parsed = payloadSchema.safeParse(json);

	if (!parsed.success) return [];

	return parsed.data.map((line) => ({ ...line, note: normalizeNote(line.note) }));
}
