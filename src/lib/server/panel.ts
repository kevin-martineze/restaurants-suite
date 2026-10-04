import type { Cookies } from '@sveltejs/kit';
import type { ApiResult } from '$lib/server/api/client';

import { error, redirect } from '@sveltejs/kit';

import { clearSession } from '$lib/server/session';

/**
 * Lo que devolvió la API para una carga del panel: el dato, o la salida que
 * corresponde. Una sesión que la API ya no acepta (venció o le quitaron el
 * acceso) se borra y se vuelve a entrar.
 */
export function panelData<T>(result: ApiResult<T>, cookies: Cookies, pathname: string): T {
	if (result.ok) return result.data;

	if (result.status === 401 || result.status === 403) {
		clearSession(cookies);
		redirect(303, `/login?redirectTo=${encodeURIComponent(pathname)}`);
	}

	error(result.status >= 400 && result.status < 500 ? result.status : 503, result.message);
}
