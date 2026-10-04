import { redirect } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';
import { clearSession } from '$lib/server/session';

export const load: PageServerLoad = () => redirect(303, '/entrar');

export const actions: Actions = {
	default: ({ cookies }) => {
		clearSession(cookies);
		redirect(303, '/entrar');
	}
};
