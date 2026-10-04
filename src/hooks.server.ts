import type { Handle } from '@sveltejs/kit';

import { clearSession, readSession, SESSION_COOKIE } from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
	const session = readSession(event.cookies);

	// Una cookie vencida o alterada no sirve de nada: se borra.
	if (!session && event.cookies.get(SESSION_COOKIE)) clearSession(event.cookies);

	event.locals.session = session;

	return resolve(event);
};
