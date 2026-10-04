import type { PageServerLoad } from './$types';
import { activeOrders } from '$lib/server/api/panel';
import { panelContext } from '$lib/server/context';
import { panelData } from '$lib/server/panel';

export const load: PageServerLoad = async (event) => {
	const ctx = panelContext(event);

	event.depends('panel:orders');

	const orders = panelData(await activeOrders(ctx), event.cookies, event.url.pathname);

	// La cocina solo ve lo que le toca: aceptado (por empezar) y en preparación.
	return { orders: orders.filter((o) => o.status === 'accepted' || o.status === 'preparing') };
};

// Mover un pedido es la misma acción que en el tablero.
export { actions } from '../dashboard/+page.server';
