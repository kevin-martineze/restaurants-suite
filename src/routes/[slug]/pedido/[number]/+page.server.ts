import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import { trackOrder } from '$lib/server/api/checkout';
import { getMenu } from '$lib/server/api/menu';
import { publicContext } from '$lib/server/context';

export const load: PageServerLoad = async (event) => {
	const ctx = publicContext(event);
	const number = Number(event.params.number);
	const token = event.url.searchParams.get('t') ?? '';

	if (!Number.isInteger(number) || number <= 0 || token === '') {
		error(404, 'No encontramos ese pedido.');
	}

	const [order, menu] = await Promise.all([trackOrder(ctx, number, token), getMenu(ctx)]);

	if (!order.ok) error(order.status === 404 ? 404 : 503, order.message);

	return {
		order: order.data,
		theme: menu.ok ? menu.data.restaurant.theme : null,
		// Recién creado desde el checkout: la página vacía el carrito.
		fresh: event.url.searchParams.get('nuevo') === '1'
	};
};
