import type { RequestEvent } from '@sveltejs/kit';
import type { ApiResult } from '$lib/server/api/client';
import type { BrandSettings } from '$lib/domain/brand';

import { fail, redirect } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';
import { brandSettingsSchema } from '$lib/schemas/brand';
import {
	brandSettings,
	removeCover,
	removeLogo,
	updateBrandSettings,
	uploadCover,
	uploadLogo
} from '$lib/server/api/panel-brand';
import { panelBrandId, panelContext } from '$lib/server/context';
import { panelData } from '$lib/server/panel';

/** La marca es solo del dueño y el gerente. */
function context(event: RequestEvent) {
	const ctx = panelContext(event);
	const membership = event.locals.session?.memberships.find((m) => m.tenantId === ctx.tenantId);
	const role = membership?.role;

	if (role !== 'owner' && role !== 'manager') redirect(303, '/dashboard');

	return { ctx, brandId: panelBrandId(event, ctx) };
}

export const load: PageServerLoad = async (event) => {
	const { ctx, brandId } = context(event);

	event.depends('panel:brand');

	return {
		settings: panelData(await brandSettings(ctx, brandId), event.cookies, event.url.pathname)
	};
};

function failed(result: Extract<ApiResult<BrandSettings>, { ok: false }>) {
	return fail(result.status >= 400 && result.status < 500 ? result.status : 503, {
		brandError: result.message
	});
}

function invalid(message: string | undefined) {
	return fail(400, { brandError: message ?? 'Revisa los datos.' });
}

/** El mismo techo que la foto de un producto: una foto de celular pesa 3-5 MB. */
const MAX_PHOTO_BYTES = 12 * 1024 * 1024;

async function readImage(event: RequestEvent): Promise<File | { error: string }> {
	const image = (await event.request.formData()).get('image');

	if (!(image instanceof File) || image.size === 0) return { error: 'Elige una imagen.' };
	if (!image.type.startsWith('image/')) return { error: 'El archivo no es una imagen.' };
	if (image.size > MAX_PHOTO_BYTES) return { error: 'La imagen pesa más de 12 MB.' };

	return image;
}

export const actions: Actions = {
	save: async (event) => {
		const { ctx, brandId } = context(event);
		const formData = await event.request.formData();
		const parsed = brandSettingsSchema.safeParse({
			name: formData.get('name'),
			tagline: formData.get('tagline'),
			primary: formData.get('primary')
		});

		if (!parsed.success) return invalid(parsed.error.issues[0]?.message);

		const result = await updateBrandSettings(ctx, brandId, parsed.data);

		return result.ok ? { settings: result.data } : failed(result);
	},

	logo: async (event) => {
		const { ctx, brandId } = context(event);
		const image = await readImage(event);

		if (!(image instanceof File)) return invalid(image.error);

		const result = await uploadLogo(ctx, brandId, image);

		return result.ok ? { settings: result.data } : failed(result);
	},

	removeLogo: async (event) => {
		const { ctx, brandId } = context(event);
		const result = await removeLogo(ctx, brandId);

		return result.ok ? { settings: result.data } : failed(result);
	},

	cover: async (event) => {
		const { ctx, brandId } = context(event);
		const image = await readImage(event);

		if (!(image instanceof File)) return invalid(image.error);

		const result = await uploadCover(ctx, brandId, image);

		return result.ok ? { settings: result.data } : failed(result);
	},

	removeCover: async (event) => {
		const { ctx, brandId } = context(event);
		const result = await removeCover(ctx, brandId);

		return result.ok ? { settings: result.data } : failed(result);
	}
};
