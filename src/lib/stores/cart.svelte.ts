import type { CartLine } from '$lib/domain/cart';

import { browser } from '$app/environment';

import { clampQty, lineKey } from '$lib/domain/cart';

/**
 * El carrito de la carta, en `localStorage`, uno por restaurante.
 *
 * Guarda solo identificadores y cantidades más una vista previa para pintar.
 * Nunca es fuente de verdad del precio: lo recalcula el servidor al cotizar,
 * así un carrito viejo no puede pedir a precio viejo.
 */

const STORAGE_VERSION = 'v1';

function storageKey(slug: string): string {
	return `carta:${slug}:cart:${STORAGE_VERSION}`;
}

function readStorage(slug: string): CartLine[] {
	if (!browser) return [];

	try {
		const raw = localStorage.getItem(storageKey(slug));

		if (!raw) return [];

		const parsed: unknown = JSON.parse(raw);

		if (!Array.isArray(parsed)) return [];

		return parsed.filter(isCartLine);
	} catch {
		// Storage corrupto o bloqueado: se arranca con carrito vacío.
		return [];
	}
}

function isCartLine(value: unknown): value is CartLine {
	if (typeof value !== 'object' || value === null) return false;

	const line: Record<string, unknown> = { ...value };
	const preview = line.preview;

	if (typeof preview !== 'object' || preview === null) return false;

	const previewRecord: Record<string, unknown> = { ...preview };

	return (
		typeof line.key === 'string' &&
		typeof line.itemId === 'string' &&
		Array.isArray(line.modifierIds) &&
		line.modifierIds.every((id) => typeof id === 'string') &&
		typeof line.note === 'string' &&
		typeof line.qty === 'number' &&
		line.qty > 0 &&
		typeof previewRecord.name === 'string' &&
		typeof previewRecord.unitPrice === 'number'
	);
}

class Cart {
	lines = $state<CartLine[]>([]);
	/** La hoja del carrito; se abre desde la barra inferior. */
	open = $state(false);

	count = $derived(this.lines.reduce((sum, line) => sum + line.qty, 0));
	/** Subtotal orientativo para la barra. El que vale lo calcula el servidor. */
	previewSubtotal = $derived(
		this.lines.reduce((sum, line) => sum + line.preview.unitPrice * line.qty, 0)
	);
	isEmpty = $derived(this.lines.length === 0);

	#slug: string | null = null;

	/** Carga el carrito del restaurante. Se llama al montar la carta. */
	hydrate(slug: string) {
		this.#slug = slug;
		this.lines = readStorage(slug);
	}

	#persist() {
		if (!browser || !this.#slug) return;

		try {
			localStorage.setItem(storageKey(this.#slug), JSON.stringify(this.lines));
		} catch {
			// Modo privado con storage lleno: el carrito sigue funcionando en memoria.
		}
	}

	/** Agrega una línea; si ya hay una igual (misma clave), suma la cantidad. */
	add(line: Omit<CartLine, 'key'>) {
		const key = lineKey(line.itemId, line.modifierIds, line.note);
		const existing = this.lines.find((item) => item.key === key);

		if (existing) {
			existing.qty = clampQty(existing.qty + line.qty);
			existing.preview = line.preview;
		} else {
			this.lines.push({ ...line, key, qty: clampQty(line.qty) });
		}

		this.#persist();
	}

	setQty(key: string, qty: number) {
		if (qty <= 0) {
			this.remove(key);

			return;
		}

		const line = this.lines.find((item) => item.key === key);

		if (!line) return;

		line.qty = clampQty(qty);
		this.#persist();
	}

	remove(key: string) {
		this.lines = this.lines.filter((line) => line.key !== key);
		this.#persist();
	}

	clear() {
		this.lines = [];
		this.#persist();
	}

	/** Lo que se manda a la form action: solo identificadores y cantidades. */
	serialize(): string {
		return JSON.stringify(
			this.lines.map((line) => ({
				itemId: line.itemId,
				modifierIds: line.modifierIds,
				note: line.note,
				qty: line.qty
			}))
		);
	}
}

export const cart = new Cart();
