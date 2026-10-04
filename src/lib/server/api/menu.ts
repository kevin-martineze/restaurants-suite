import type { ItemTag, Menu } from '$lib/domain/menu';
import type { ApiResult } from '$lib/server/api/client';
import type { PublicContext } from '$lib/server/context';

import { z } from 'zod';

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
		fulfillment: z.array(z.enum(['delivery', 'pickup', 'dine_in'])),
		location: z.object({ lat: z.number(), lng: z.number() }).nullable().default(null)
	}),
	status: z.object({ open: z.boolean(), label: z.string() }),
	kitchen: z
		.object({ load: z.enum(['calm', 'busy', 'saturated']), label: z.string() })
		.default({ load: 'calm', label: 'Cocina al día' }),
	categories: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			items: z.array(itemSchema)
		})
	)
});

export function getMenu(ctx: PublicContext): Promise<ApiResult<Menu>> {
	return publicRequest(ctx, '/menu', menuResponseSchema);
}
