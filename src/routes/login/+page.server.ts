import { fail, redirect } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';
import { loginSchema } from '$lib/schemas/login';
import { login } from '$lib/server/api/auth';
import { clientAddress, safeRedirectTarget } from '$lib/server/context';
import { writeSession } from '$lib/server/session';

/** A dónde va cada rol al entrar: la cocina a su vista, el resto al tablero. */
function homeFor(role: string): string {
	return role === 'kitchen' ? '/kitchen' : '/dashboard';
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = locals.session;

	if (session) {
		const role = session.memberships.find((m) => m.tenantId === session.tenantId)?.role ?? '';

		redirect(303, safeRedirectTarget(url.searchParams.get('redirectTo'), homeFor(role)));
	}

	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const parsed = loginSchema.safeParse({
			email: formData.get('email'),
			password: formData.get('password')
		});

		if (!parsed.success) {
			return fail(400, {
				email: String(formData.get('email') ?? ''),
				message: parsed.error.issues[0]?.message ?? 'Revisa los datos.'
			});
		}

		const result = await login(parsed.data.email, parsed.data.password, clientAddress(event));

		if (!result.ok) {
			return fail(result.status === 0 ? 503 : result.status, {
				email: parsed.data.email,
				message: result.message
			});
		}

		// Por ahora se entra al primer restaurante y a su primera sede; elegir
		// entre varios llega con las cadenas.
		const membership = result.data.memberships[0];
		const branch = membership?.branches[0];

		if (!membership || !branch) {
			return fail(403, {
				email: parsed.data.email,
				message: 'Tu cuenta todavía no tiene una sede asignada.'
			});
		}

		writeSession(
			event.cookies,
			{
				...result.data,
				tenantId: membership.tenantId,
				branchId: branch.id
			},
			event.url.protocol === 'https:'
		);

		redirect(
			303,
			safeRedirectTarget(event.url.searchParams.get('redirectTo'), homeFor(membership.role))
		);
	}
};
