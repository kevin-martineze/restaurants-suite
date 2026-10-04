import type { LayoutServerLoad } from './$types';
import { branchLive } from '$lib/server/api/panel';
import { panelContext } from '$lib/server/context';
import { panelData } from '$lib/server/panel';

export const load: LayoutServerLoad = async (event) => {
	const ctx = panelContext(event);
	const session = event.locals.session;
	const membership = session?.memberships.find((m) => m.tenantId === ctx.tenantId);

	event.depends('panel:branch');

	const branch = panelData(await branchLive(ctx), event.cookies, event.url.pathname);

	return {
		user: session?.user ?? null,
		tenantName: membership?.tenantName ?? '',
		role: membership?.role ?? 'cashier',
		/** La carta pública del restaurante, para el enlace "Ver carta". */
		menuSlug: membership?.brands[0]?.slug ?? null,
		branch
	};
};
