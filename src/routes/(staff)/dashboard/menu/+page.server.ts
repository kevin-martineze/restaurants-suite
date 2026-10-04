import type { RequestEvent } from '@sveltejs/kit';
import type { AdminMenu } from '$lib/domain/menu-admin';
import type { ApiResult } from '$lib/server/api/client';

import { fail } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';
import { moveId } from '$lib/domain/menu-admin';
import {
	availabilityFormSchema,
	categoryFormSchema,
	groupFormSchema,
	itemFormSchema,
	moveFormSchema
} from '$lib/schemas/menu-admin';
import { panelMenu } from '$lib/server/api/panel-menu';
import { panelBrandId, panelContext } from '$lib/server/context';
import { panelData } from '$lib/server/panel';

export const load: PageServerLoad = async (event) => {
	const ctx = panelContext(event);

	event.depends('panel:menu');

	return {
		menu: panelData(
			await panelMenu.get(ctx, panelBrandId(event, ctx)),
			event.cookies,
			event.url.pathname
		)
	};
};

/** Los campos del formulario como objeto; los repetidos (casillas) como lista. */
function read(formData: FormData, lists: string[] = []): Record<string, unknown> {
	const data: Record<string, unknown> = {};

	for (const [key, value] of formData) {
		if (typeof value !== 'string' || value === '') continue;

		data[key] = lists.includes(key) ? formData.getAll(key) : value;
	}

	for (const key of lists) data[key] ??= [];

	return data;
}

function failed(result: Extract<ApiResult<AdminMenu>, { ok: false }>) {
	return fail(result.status >= 400 && result.status < 500 ? result.status : 503, {
		menuError: result.message
	});
}

function invalid(message: string | undefined) {
	return fail(400, { menuError: message ?? 'Revisa los datos.' });
}

/** Cada acción empieza aquí: las actions no pasan por el `load` del layout. */
function context(event: RequestEvent) {
	const ctx = panelContext(event);

	return { ctx, brandId: panelBrandId(event, ctx) };
}

export const actions: Actions = {
	category: async (event) => {
		const { ctx, brandId } = context(event);
		const parsed = categoryFormSchema.safeParse(read(await event.request.formData()));

		if (!parsed.success) return invalid(parsed.error.issues[0]?.message);

		const { categoryId, name, role } = parsed.data;
		const result = categoryId
			? await panelMenu.updateCategory(ctx, brandId, categoryId, { name, role })
			: await panelMenu.createCategory(ctx, brandId, name, role);

		return result.ok ? { saved: 'category' } : failed(result);
	},

	toggleCategory: async (event) => {
		const { ctx, brandId } = context(event);
		const formData = await event.request.formData();
		const categoryId = String(formData.get('categoryId') ?? '');
		const result = await panelMenu.updateCategory(ctx, brandId, categoryId, {
			active: formData.get('active') === 'true'
		});

		return result.ok ? { saved: 'category' } : failed(result);
	},

	deleteCategory: async (event) => {
		const { ctx, brandId } = context(event);
		const categoryId = String((await event.request.formData()).get('categoryId') ?? '');
		const result = await panelMenu.deleteCategory(ctx, brandId, categoryId);

		return result.ok ? { saved: 'category' } : failed(result);
	},

	moveCategory: async (event) => {
		const { ctx, brandId } = context(event);
		const parsed = moveFormSchema.safeParse(read(await event.request.formData()));

		if (!parsed.success) return invalid(undefined);

		const current = await panelMenu.get(ctx, brandId);

		if (!current.ok) return failed(current);

		const ids = moveId(
			current.data.categories.map((category) => category.id),
			parsed.data.id,
			parsed.data.direction === -1 ? -1 : 1
		);
		const result = await panelMenu.reorderCategories(ctx, brandId, ids);

		return result.ok ? { saved: 'order' } : failed(result);
	},

	item: async (event) => {
		const { ctx, brandId } = context(event);
		const parsed = itemFormSchema.safeParse(
			read(await event.request.formData(), ['tags', 'modifierGroupIds', 'pairsWith'])
		);

		if (!parsed.success) return invalid(parsed.error.issues[0]?.message);

		const { itemId, ...item } = parsed.data;
		const result = itemId
			? await panelMenu.updateItem(ctx, brandId, itemId, item)
			: await panelMenu.createItem(ctx, brandId, item);

		return result.ok ? { saved: 'item' } : failed(result);
	},

	deleteItem: async (event) => {
		const { ctx, brandId } = context(event);
		const itemId = String((await event.request.formData()).get('itemId') ?? '');
		const result = await panelMenu.deleteItem(ctx, brandId, itemId);

		return result.ok ? { saved: 'item' } : failed(result);
	},

	moveItem: async (event) => {
		const { ctx, brandId } = context(event);
		const parsed = moveFormSchema.safeParse(read(await event.request.formData()));

		if (!parsed.success || !parsed.data.categoryId) return invalid(undefined);

		const current = await panelMenu.get(ctx, brandId);

		if (!current.ok) return failed(current);

		const category = current.data.categories.find((c) => c.id === parsed.data.categoryId);
		const ids = moveId(
			category?.items.map((item) => item.id) ?? [],
			parsed.data.id,
			parsed.data.direction === -1 ? -1 : 1
		);
		const result = await panelMenu.reorderItems(ctx, brandId, parsed.data.categoryId, ids);

		return result.ok ? { saved: 'order' } : failed(result);
	},

	/** El agotado de un toque: producto u opción. */
	availability: async (event) => {
		const { ctx, brandId } = context(event);
		const parsed = availabilityFormSchema.safeParse(read(await event.request.formData()));

		if (!parsed.success) return invalid(undefined);

		const { itemId, groupId, modifierId, available } = parsed.data;
		const result = itemId
			? await panelMenu.setItemAvailability(ctx, brandId, itemId, available)
			: groupId && modifierId
				? await panelMenu.setModifierAvailability(ctx, brandId, groupId, modifierId, available)
				: null;

		if (!result) return invalid(undefined);

		return result.ok ? { saved: 'availability' } : failed(result);
	},

	group: async (event) => {
		const { ctx, brandId } = context(event);
		const parsed = groupFormSchema.safeParse(read(await event.request.formData()));

		if (!parsed.success) return invalid(parsed.error.issues[0]?.message);

		const { groupId, modifiers, ...group } = parsed.data;
		const input = {
			...group,
			modifiers: modifiers.map(({ id, ...modifier }) => (id ? { id, ...modifier } : modifier))
		};
		const result = groupId
			? await panelMenu.updateGroup(ctx, brandId, groupId, input)
			: await panelMenu.createGroup(ctx, brandId, input);

		return result.ok ? { saved: 'group' } : failed(result);
	},

	deleteGroup: async (event) => {
		const { ctx, brandId } = context(event);
		const groupId = String((await event.request.formData()).get('groupId') ?? '');
		const result = await panelMenu.deleteGroup(ctx, brandId, groupId);

		return result.ok ? { saved: 'group' } : failed(result);
	}
};
