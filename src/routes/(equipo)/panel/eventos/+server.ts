import type { RequestHandler } from './$types';
import { orderEventsPath } from '$lib/server/api/panel';
import { panelContext } from '$lib/server/context';
import { serverEnv } from '$lib/server/env';

/**
 * Los avisos en vivo del tablero, servidos por la propia carta.
 *
 * El navegador nunca habla con la API: esta ruta abre el stream SSE de la API
 * con el token de la sesión y lo reenvía tal cual. Si el navegador se va, la
 * señal corta también la conexión con la API.
 */
export const GET: RequestHandler = async (event) => {
	const ctx = panelContext(event);

	let upstream: Response;

	try {
		upstream = await fetch(`${serverEnv().API_URL}${orderEventsPath(ctx)}`, {
			headers: { accept: 'text/event-stream', authorization: `Bearer ${ctx.accessToken}` },
			signal: event.request.signal
		});
	} catch {
		return new Response(null, { status: 502 });
	}

	if (!upstream.ok || !upstream.body) {
		return new Response(null, { status: upstream.status === 401 ? 401 : 502 });
	}

	return new Response(upstream.body, {
		headers: {
			'content-type': 'text/event-stream',
			'cache-control': 'no-cache, no-transform',
			connection: 'keep-alive',
			// Caddy/nginx: no acumular el stream en el buffer.
			'x-accel-buffering': 'no'
		}
	});
};
