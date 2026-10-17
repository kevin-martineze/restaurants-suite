import type { RequestEvent } from '@sveltejs/kit';
import type { ApiResult } from '$lib/server/api/client';
import type { BranchSettings } from '$lib/domain/branch';

import { fail, redirect } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';
import { branchSettingsSchema } from '$lib/schemas/branch';
import { branchSettings, updateBranchSettings } from '$lib/server/api/panel-branch';
import { panelContext } from '$lib/server/context';
import { panelData } from '$lib/server/panel';

/** La configuración de la sede es solo del dueño y el gerente. */
function context(event: RequestEvent) {
	const ctx = panelContext(event);
	const membership = event.locals.session?.memberships.find((m) => m.tenantId === ctx.tenantId);
	const role = membership?.role;

	if (role !== 'owner' && role !== 'manager') redirect(303, '/dashboard');

	return ctx;
}

export const load: PageServerLoad = async (event) => {
	const ctx = context(event);

	event.depends('panel:branch');

	return {
		settings: panelData(await branchSettings(ctx), event.cookies, event.url.pathname)
	};
};

function failed(result: Extract<ApiResult<BranchSettings>, { ok: false }>) {
	return fail(result.status >= 400 && result.status < 500 ? result.status : 503, {
		branchError: result.message
	});
}

export const actions: Actions = {
	save: async (event) => {
		const ctx = context(event);
		const formData = await event.request.formData();
		const parsed = branchSettingsSchema.safeParse({
			name: formData.get('name'),
			address: formData.get('address'),
			etaMinutes: formData.get('etaMinutes'),
			fulfillment: formData.getAll('fulfillment'),
			schedule: formData.get('schedule'),
			location: formData.get('location') ?? '',
			deliveryRings: formData.get('deliveryRings'),
			paymentMethods: formData.getAll('paymentMethods')
		});

		if (!parsed.success) {
			return fail(400, { branchError: parsed.error.issues[0]?.message ?? 'Revisa los datos.' });
		}

		const result = await updateBranchSettings(ctx, parsed.data);

		return result.ok ? { settings: result.data } : failed(result);
	}
};
