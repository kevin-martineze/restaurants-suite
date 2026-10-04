import type { AdminMenu, CategoryRole } from '$lib/domain/menu-admin';
import type { ItemTag } from '$lib/domain/menu';
import type { ApiResult } from '$lib/server/api/client';
import type { PanelContext } from '$lib/server/context';

import { z } from 'zod';

import { panelRequest } from '$lib/server/api/request';

/** Administración de la carta (`restaurants-api`, panel · carta). */

const tagSchema = z.enum(['popular', 'new', 'spicy', 'vegetarian']);
const roleSchema = z.enum(['main', 'side', 'drink', 'dessert']);

const adminMenuSchema = z.object({
	brand: z.object({ id: z.string(), name: z.string(), slug: z.string() }),
	categories: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			role: roleSchema,
			active: z.boolean(),
			items: z.array(
				z.object({
					id: z.string(),
					categoryId: z.string(),
					name: z.string(),
					description: z.string().nullable(),
					price: z.number().int(),
					imageUrl: z.string().nullable(),
					available: z.boolean(),
					tags: z.array(tagSchema),
					modifierGroupIds: z.array(z.string()),
					pairsWith: z.array(z.string())
				})
			)
		})
	),
	groups: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			min: z.number().int(),
			max: z.number().int(),
			modifiers: z.array(
				z.object({
					id: z.string(),
					name: z.string(),
					priceDelta: z.number().int(),
					available: z.boolean()
				})
			),
			usedBy: z.number().int()
		})
	)
});

export interface ItemInput {
	categoryId: string;
	name: string;
	description: string;
	price: number;
	tags: ItemTag[];
	modifierGroupIds: string[];
	pairsWith: string[];
}

export interface GroupInput {
	name: string;
	min: number;
	max: number;
	modifiers: { id?: string; name: string; priceDelta: number; available: boolean }[];
}

function path(brandId: string, rest = ''): string {
	return `/brands/${encodeURIComponent(brandId)}/menu${rest}`;
}

function send(
	ctx: PanelContext,
	brandId: string,
	rest: string,
	method: 'POST' | 'PATCH' | 'DELETE',
	body?: unknown
): Promise<ApiResult<AdminMenu>> {
	return panelRequest(ctx, path(brandId, rest), adminMenuSchema, {
		method,
		...(body === undefined ? {} : { body })
	});
}

const segment = encodeURIComponent;

export const panelMenu = {
	get: (ctx: PanelContext, brandId: string) => panelRequest(ctx, path(brandId), adminMenuSchema),

	createCategory: (ctx: PanelContext, brandId: string, name: string, role: CategoryRole) =>
		send(ctx, brandId, '/categories', 'POST', { name, role }),
	updateCategory: (
		ctx: PanelContext,
		brandId: string,
		categoryId: string,
		changes: { name?: string; role?: CategoryRole; active?: boolean }
	) => send(ctx, brandId, `/categories/${segment(categoryId)}`, 'PATCH', changes),
	deleteCategory: (ctx: PanelContext, brandId: string, categoryId: string) =>
		send(ctx, brandId, `/categories/${segment(categoryId)}`, 'DELETE'),
	reorderCategories: (ctx: PanelContext, brandId: string, ids: string[]) =>
		send(ctx, brandId, '/categories/reorder', 'POST', { ids }),

	createItem: (ctx: PanelContext, brandId: string, item: ItemInput) =>
		send(ctx, brandId, '/items', 'POST', item),
	updateItem: (ctx: PanelContext, brandId: string, itemId: string, item: ItemInput) =>
		send(ctx, brandId, `/items/${segment(itemId)}`, 'PATCH', item),
	deleteItem: (ctx: PanelContext, brandId: string, itemId: string) =>
		send(ctx, brandId, `/items/${segment(itemId)}`, 'DELETE'),
	reorderItems: (ctx: PanelContext, brandId: string, categoryId: string, ids: string[]) =>
		send(ctx, brandId, `/categories/${segment(categoryId)}/items/reorder`, 'POST', { ids }),
	setItemAvailability: (ctx: PanelContext, brandId: string, itemId: string, available: boolean) =>
		send(ctx, brandId, `/items/${segment(itemId)}/availability`, 'PATCH', { available }),

	createGroup: (ctx: PanelContext, brandId: string, group: GroupInput) =>
		send(ctx, brandId, '/groups', 'POST', group),
	updateGroup: (ctx: PanelContext, brandId: string, groupId: string, group: GroupInput) =>
		send(ctx, brandId, `/groups/${segment(groupId)}`, 'PATCH', group),
	deleteGroup: (ctx: PanelContext, brandId: string, groupId: string) =>
		send(ctx, brandId, `/groups/${segment(groupId)}`, 'DELETE'),
	/** La foto se reenvía tal cual llegó: la API la achica y la guarda. */
	uploadImage: (ctx: PanelContext, brandId: string, itemId: string, image: File) => {
		const formData = new FormData();

		formData.append('image', image, image.name || 'foto');

		return panelRequest(ctx, path(brandId, `/items/${segment(itemId)}/image`), adminMenuSchema, {
			method: 'POST',
			formData
		});
	},
	removeImage: (ctx: PanelContext, brandId: string, itemId: string) =>
		send(ctx, brandId, `/items/${segment(itemId)}/image`, 'DELETE'),

	setModifierAvailability: (
		ctx: PanelContext,
		brandId: string,
		groupId: string,
		modifierId: string,
		available: boolean
	) =>
		send(
			ctx,
			brandId,
			`/groups/${segment(groupId)}/modifiers/${segment(modifierId)}/availability`,
			'PATCH',
			{ available }
		)
};
