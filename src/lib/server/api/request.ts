import type { ApiResult, RequestOptions, ResponseSchema } from '$lib/server/api/client';
import type { PanelContext, PublicContext } from '$lib/server/context';

import { apiRequest } from '$lib/server/api/client';

type Options = Omit<RequestOptions, 'accessToken' | 'clientIp'>;

/** Carta pública: `/public/:slug/*`, sin sesión y con la IP del cliente. */
export function publicRequest<T>(
	ctx: PublicContext,
	path: string,
	schema: ResponseSchema<T>,
	options: Options = {}
): Promise<ApiResult<T>> {
	return apiRequest(`/public/${encodeURIComponent(ctx.slug)}${path}`, schema, {
		...options,
		clientIp: ctx.clientIp
	});
}

/** Segmento de URL armado con algo que llegó de un formulario o de la ruta. */
export function segment(value: string): string {
	return encodeURIComponent(value);
}

/** Panel: `/tenants/:tenantId/*`, con el token de la sesión. */
export function panelRequest<T>(
	ctx: PanelContext,
	path: string,
	schema: ResponseSchema<T>,
	options: Options = {}
): Promise<ApiResult<T>> {
	return apiRequest(`/tenants/${encodeURIComponent(ctx.tenantId)}${path}`, schema, {
		...options,
		accessToken: ctx.accessToken,
		clientIp: ctx.clientIp
	});
}
