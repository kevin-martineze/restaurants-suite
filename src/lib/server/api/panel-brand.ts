import type { BrandSettings } from '$lib/domain/brand';
import type { ApiResult } from '$lib/server/api/client';
import type { PanelContext } from '$lib/server/context';

import { z } from 'zod';

import { panelRequest } from '$lib/server/api/request';

/** La marca (`restaurants-api`, panel · marca). */

const brandSettingsSchema = z.object({
	slug: z.string(),
	name: z.string(),
	tagline: z.string().nullable(),
	theme: z.object({ primary: z.string(), primaryForeground: z.string() }),
	logoUrl: z.string().nullable(),
	coverUrl: z.string().nullable()
});

function path(brandId: string, rest = ''): string {
	return `/brands/${encodeURIComponent(brandId)}${rest}`;
}

export function brandSettings(
	ctx: PanelContext,
	brandId: string
): Promise<ApiResult<BrandSettings>> {
	return panelRequest(ctx, path(brandId, '/settings'), brandSettingsSchema);
}

export function updateBrandSettings(
	ctx: PanelContext,
	brandId: string,
	changes: { name: string; tagline: string | null; primary: string }
): Promise<ApiResult<BrandSettings>> {
	return panelRequest(ctx, path(brandId, '/settings'), brandSettingsSchema, {
		method: 'PATCH',
		body: { name: changes.name, tagline: changes.tagline, theme: { primary: changes.primary } }
	});
}

/** El logo se reenvía tal cual llegó: la API lo achica a 512 px y lo guarda. */
export function uploadLogo(
	ctx: PanelContext,
	brandId: string,
	image: File
): Promise<ApiResult<BrandSettings>> {
	const formData = new FormData();

	formData.append('image', image, image.name || 'logo');

	return panelRequest(ctx, path(brandId, '/logo'), brandSettingsSchema, {
		method: 'POST',
		formData
	});
}

export function removeLogo(ctx: PanelContext, brandId: string): Promise<ApiResult<BrandSettings>> {
	return panelRequest(ctx, path(brandId, '/logo'), brandSettingsSchema, { method: 'DELETE' });
}

/** La portada se reenvía tal cual llegó: la API la achica a 1600 px. */
export function uploadCover(
	ctx: PanelContext,
	brandId: string,
	image: File
): Promise<ApiResult<BrandSettings>> {
	const formData = new FormData();

	formData.append('image', image, image.name || 'portada');

	return panelRequest(ctx, path(brandId, '/cover'), brandSettingsSchema, {
		method: 'POST',
		formData
	});
}

export function removeCover(ctx: PanelContext, brandId: string): Promise<ApiResult<BrandSettings>> {
	return panelRequest(ctx, path(brandId, '/cover'), brandSettingsSchema, { method: 'DELETE' });
}
