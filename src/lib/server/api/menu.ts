import type { CartRequestLine, Quote } from '$lib/domain/cart';
import type { ItemTag, Menu } from '$lib/domain/menu';
import type { ApiResult } from '$lib/server/api/client';
import type { PublicContext } from '$lib/server/context';

import { z } from 'zod';

import { lineKey } from '$lib/domain/cart';
import { ITEM_TAG_LABEL } from '$lib/domain/menu';
import { publicRequest } from '$lib/server/api/request';

/**
 * Carta pública y cotización del carrito (`restaurants-api`, módulo `menu`).
 *
 * Las respuestas se leen con zod y se traducen a `$lib/domain/*`: si un campo
 * cambia en la API, se ajusta aquí y ninguna página se entera.
 */

function isItemTag(tag: string): tag is ItemTag {
	return tag in ITEM_TAG_LABEL;
}

const modifierSchema = z.object({
	id: z.string(),
	name: z.string(),
	priceDelta: z.number().int(),
	available: z.boolean()
});

const groupSchema = z.object({
	id: z.string(),
	name: z.string(),
	min: z.number().int(),
	max: z.number().int(),
	modifiers: z.array(modifierSchema)
});

const itemSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	price: z.number().int(),
	imageUrl: z.string().nullable(),
	available: z.boolean(),
	// Una etiqueta que este frontend todavía no conoce se descarta en vez de
	// romper la carta entera.
	tags: z
		.array(z.string())
		.default([])
		.transform((tags) => tags.filter(isItemTag)),
	groups: z.array(groupSchema),
	suggestedItemIds: z.array(z.string()).default([])
});

export const menuResponseSchema = z.object({
	restaurant: z.object({
		slug: z.string(),
		name: z.string(),
		tagline: z.string().nullable(),
		logoUrl: z.string().nullable(),
		coverUrl: z.string().nullable(),
		theme: z.object({ primary: z.string(), primaryForeground: z.string() })
	}),
	branch: z.object({
		id: z.string(),
		name: z.string(),
		address: z.string(),
		etaMinutes: z.number().int(),
		fulfillment: z.array(z.enum(['delivery', 'pickup', 'dine_in']))
	}),
	status: z.object({ open: z.boolean(), label: z.string() }),
	categories: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			items: z.array(itemSchema)
		})
	)
});

/** La API identifica cada línea por su posición en la petición. */
export const quoteResponseSchema = z.object({
	lines: z.array(
		z.object({
			index: z.number().int(),
			itemId: z.string(),
			modifierIds: z.array(z.string()),
			name: z.string(),
			modifiersLabel: z.string(),
			note: z.string(),
			qty: z.number().int(),
			unitPrice: z.number().int(),
			total: z.number().int()
		})
	),
	rejected: z.array(z.object({ index: z.number().int(), name: z.string(), reason: z.string() })),
	subtotal: z.number().int()
});

export function getMenu(ctx: PublicContext): Promise<ApiResult<Menu>> {
	return publicRequest(ctx, '/menu', menuResponseSchema);
}

/**
 * Cotiza el carrito. La API responde por posición; aquí cada línea recupera la
 * clave con la que la conoce el carrito del navegador.
 */
export async function quoteCart(
	ctx: PublicContext,
	lines: CartRequestLine[]
): Promise<ApiResult<Quote>> {
	const result = await publicRequest(ctx, '/quote', quoteResponseSchema, {
		method: 'POST',
		body: { lines }
	});

	if (!result.ok) return result;

	const keyAt = (index: number): string => {
		const line = lines[index];

		return line ? lineKey(line.itemId, line.modifierIds, line.note) : `#${index}`;
	};

	return {
		ok: true,
		data: {
			lines: result.data.lines.map(({ index, ...line }) => ({ ...line, key: keyAt(index) })),
			rejected: result.data.rejected.map(({ index, ...line }) => ({ ...line, key: keyAt(index) })),
			subtotal: result.data.subtotal
		}
	};
}
