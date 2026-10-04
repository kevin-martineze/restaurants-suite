import { error, fail } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';
import { getMenu, quoteCart } from '$lib/server/api/menu';
import { parseCartPayload } from '$lib/server/cart';
import { publicContext } from '$lib/server/context';

export const load: PageServerLoad = async (event) => {
	const result = await getMenu(publicContext(event));

	if (!result.ok) error(result.status === 404 ? 404 : 503, result.message);

	return { menu: result.data };
};

export const actions: Actions = {
	/**
	 * Cotiza el carrito del navegador: precios del servidor, agotados y reglas
	 * de cada grupo de opciones. Devuelve el carrito que cotizó para que la
	 * página sepa si la respuesta sigue valiendo o el cliente ya lo cambió.
	 */
	quote: async (event) => {
		const formData = await event.request.formData();
		const raw = formData.get('cart');
		const quotedCart = typeof raw === 'string' ? raw : '';
		const lines = parseCartPayload(raw);

		if (lines.length === 0) {
			return fail(400, { quotedCart, quoteError: 'Tu carrito está vacío.' });
		}

		const result = await quoteCart(publicContext(event), lines);

		if (!result.ok) {
			return fail(result.status >= 400 && result.status < 500 ? result.status : 503, {
				quotedCart,
				quoteError: result.message
			});
		}

		return { quotedCart, quote: result.data };
	}
};
