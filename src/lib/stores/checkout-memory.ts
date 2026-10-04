import type { SavedCheckout } from '$lib/domain/checkout';

import { browser } from '$app/environment';

/**
 * Lo que el cliente escribió en su último pedido, guardado en su propio
 * celular: nombre, celular, dirección y el punto del mapa. El segundo pedido
 * se hace en segundos. No sale del navegador salvo cuando él pide.
 */

function key(slug: string): string {
	return `carta:${slug}:checkout:v1`;
}

function isSaved(value: unknown): value is SavedCheckout {
	if (typeof value !== 'object' || value === null) return false;

	const record: Record<string, unknown> = { ...value };
	const location = record.location;
	const validLocation =
		location === null ||
		(typeof location === 'object' &&
			location !== null &&
			typeof Reflect.get(location, 'lat') === 'number' &&
			typeof Reflect.get(location, 'lng') === 'number');

	return (
		typeof record.name === 'string' &&
		typeof record.phone === 'string' &&
		typeof record.address === 'string' &&
		typeof record.neighborhood === 'string' &&
		typeof record.references === 'string' &&
		validLocation
	);
}

export function readCheckoutMemory(slug: string): SavedCheckout | null {
	if (!browser) return null;

	try {
		const raw = localStorage.getItem(key(slug));
		const parsed: unknown = raw ? JSON.parse(raw) : null;

		return isSaved(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

export function writeCheckoutMemory(slug: string, saved: SavedCheckout): void {
	if (!browser) return;

	try {
		localStorage.setItem(key(slug), JSON.stringify(saved));
	} catch {
		// Storage lleno o bloqueado: el próximo pedido se escribe a mano.
	}
}
