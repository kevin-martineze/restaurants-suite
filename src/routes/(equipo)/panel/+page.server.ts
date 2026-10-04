import { fail } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';
import { branchLiveSchema, moveOrderSchema } from '$lib/schemas/panel';
import { activeOrders, moveOrder, updateBranchLive } from '$lib/server/api/panel';
import { panelContext } from '$lib/server/context';
import { panelData } from '$lib/server/panel';

export const load: PageServerLoad = async (event) => {
	const ctx = panelContext(event);

	event.depends('panel:orders');

	return { orders: panelData(await activeOrders(ctx), event.cookies, event.url.pathname) };
};

/** Lee un campo opcional del formulario: vacío es "no viene". */
function field(formData: FormData, name: string): string | undefined {
	const value = formData.get(name);

	return typeof value === 'string' && value !== '' ? value : undefined;
}

export const actions: Actions = {
	/** Mueve un pedido: aceptar, listo, despachar, cancelar… La API decide si se puede. */
	move: async (event) => {
		const ctx = panelContext(event);
		const formData = await event.request.formData();
		const parsed = moveOrderSchema.safeParse({
			orderId: field(formData, 'orderId'),
			to: field(formData, 'to'),
			reason: field(formData, 'reason')
		});

		if (!parsed.success) return fail(400, { moveError: 'No entendimos qué cambiar.' });

		const result = await moveOrder(
			ctx,
			parsed.data.orderId,
			parsed.data.to,
			parsed.data.reason ?? null
		);

		if (!result.ok) {
			return fail(result.status >= 400 && result.status < 500 ? result.status : 503, {
				moveError: result.message,
				orderId: parsed.data.orderId
			});
		}

		return { moved: result.data.id };
	},

	/** Pausar o reanudar pedidos y marcar la carga de la cocina. */
	branch: async (event) => {
		const ctx = panelContext(event);
		const formData = await event.request.formData();
		const parsed = branchLiveSchema.safeParse({
			status: field(formData, 'status'),
			kitchenLoad: field(formData, 'kitchenLoad')
		});

		if (!parsed.success) return fail(400, { branchError: 'No hay nada que cambiar.' });

		const result = await updateBranchLive(ctx, parsed.data);

		if (!result.ok) {
			return fail(result.status >= 400 && result.status < 500 ? result.status : 503, {
				branchError: result.message
			});
		}

		return { branch: result.data };
	}
};
