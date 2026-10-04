import type { RequestEvent } from '@sveltejs/kit';

import { error } from '@sveltejs/kit';

/** Con qué restaurante y desde dónde habla la carta con la API. */
export interface PublicContext {
	slug: string;
	clientIp: string | null;
}

/** La IP de quien hizo la petición, o null si el adaptador no la sabe. */
export function clientAddress(event: Pick<RequestEvent, 'getClientAddress'>): string | null {
	try {
		return event.getClientAddress();
	} catch {
		return null;
	}
}

/** La carta responde al restaurante de la URL: `/{slug}`. */
export function publicContext(
	event: Pick<RequestEvent, 'getClientAddress' | 'params'>
): PublicContext {
	const slug = event.params.slug;

	if (!slug) error(404, 'Este restaurante no existe.');

	return { slug, clientIp: clientAddress(event) };
}
