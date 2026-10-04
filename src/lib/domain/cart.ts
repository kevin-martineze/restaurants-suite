/**
 * El carrito de la carta.
 *
 * En la tienda de ropa una línea era una variante. Aquí dos hamburguesas
 * iguales, una con tocineta y otra sin, son dos líneas distintas: la línea es
 * el producto con lo que se eligió y la nota.
 */

export const MAX_QTY_PER_LINE = 20;
export const MAX_NOTE_LENGTH = 140;

/** Lo que el navegador manda al servidor: solo identificadores, nunca precios. */
export interface CartRequestLine {
	itemId: string;
	modifierIds: string[];
	note: string;
	qty: number;
}

export interface CartLine extends CartRequestLine {
	/** Misma clave, misma línea: agregar otra igual suma cantidad. */
	key: string;
	/** Solo para pintar sin ir al servidor; no es fuente de verdad. */
	preview: {
		name: string;
		/** "Tres cuartos · Tocineta". Vacío si no tiene opciones. */
		modifiersLabel: string;
		unitPrice: number;
		imageUrl: string | null;
	};
}

/** Línea cotizada por el servidor: este precio es el que vale. */
export interface QuotedLine {
	key: string;
	itemId: string;
	modifierIds: string[];
	name: string;
	modifiersLabel: string;
	note: string;
	qty: number;
	unitPrice: number;
	total: number;
}

/** Línea que el servidor no aceptó, con el motivo listo para mostrar. */
export interface RejectedLine {
	key: string;
	name: string;
	reason: string;
}

export interface Quote {
	lines: QuotedLine[];
	rejected: RejectedLine[];
	subtotal: number;
}

/** La nota como se guarda: sin espacios de sobra y con largo acotado. */
export function normalizeNote(note: string): string {
	return note.replace(/\s+/g, ' ').trim().slice(0, MAX_NOTE_LENGTH);
}

/**
 * Clave de la línea. El orden en que se marcaron las opciones no importa, ni
 * las mayúsculas de la nota: "Sin cebolla" y "sin cebolla " son la misma.
 */
export function lineKey(itemId: string, modifierIds: readonly string[], note: string): string {
	return [itemId, [...modifierIds].sort().join(','), normalizeNote(note).toLowerCase()].join('|');
}

export function clampQty(qty: number): number {
	if (!Number.isFinite(qty)) return 1;

	return Math.min(Math.max(Math.trunc(qty), 1), MAX_QTY_PER_LINE);
}
