import type { RequestEvent } from '@sveltejs/kit';

import { error, redirect } from '@sveltejs/kit';

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

/** Con qué sesión, en qué restaurante y en qué sede habla el panel con la API. */
export interface PanelContext {
	tenantId: string;
	branchId: string;
	accessToken: string;
	clientIp: string | null;
}

/**
 * El contexto del panel, o a la página de entrar si no hay sesión.
 *
 * Toda carga y toda form action del panel empieza aquí: las actions no pasan
 * por el `load` del layout, así que no heredan su verificación.
 */
export function panelContext(
	event: Pick<RequestEvent, 'getClientAddress' | 'locals' | 'url'>
): PanelContext {
	const session = event.locals.session;

	if (!session) {
		redirect(303, `/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
	}

	return {
		tenantId: session.tenantId,
		branchId: session.branchId,
		accessToken: session.accessToken,
		clientIp: clientAddress(event)
	};
}

/** Solo rutas internas: un `redirectTo` que apunte a otro sitio se ignora. */
export function safeRedirectTarget(value: string | null, fallback = '/dashboard'): string {
	if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
		return fallback;
	}

	return value;
}
