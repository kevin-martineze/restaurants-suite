import type { CheckoutFulfillment } from '$lib/domain/checkout';
import type { GeoPoint } from '$lib/domain/menu';
import type { PublicContext } from '$lib/server/context';

import { error, fail, redirect } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';
import { checkoutFormSchema } from '$lib/schemas/checkout';
import { createOrder, notOrderableSchema, previewCheckout } from '$lib/server/api/checkout';
import { getMenu } from '$lib/server/api/menu';
import { parseCartPayload } from '$lib/server/cart';
import { publicContext } from '$lib/server/context';

const IDEMPOTENCY_KEY = /^[A-Za-z0-9_-]{16,128}$/;

export const load: PageServerLoad = async (event) => {
	const result = await getMenu(publicContext(event));

	if (!result.ok) error(result.status === 404 ? 404 : 503, result.message);

	return { menu: result.data };
};

function readFulfillment(value: FormDataEntryValue | null): CheckoutFulfillment {
	return value === 'pickup' ? 'pickup' : 'delivery';
}

function readLocation(formData: FormData): GeoPoint | null {
	const lat = Number(formData.get('lat'));
	const lng = Number(formData.get('lng'));

	if (!formData.get('lat') || !formData.get('lng')) return null;
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

	return { lat, lng };
}

/**
 * La clave con la que la página sabe si una cotización corresponde a lo que
 * tiene en pantalla: carrito, tipo de entrega y punto del mapa.
 */
function previewKeyOf(formData: FormData): string {
	return JSON.stringify([
		formData.get('cart') ?? '',
		formData.get('fulfillment') ?? '',
		formData.get('lat') ?? '',
		formData.get('lng') ?? ''
	]);
}

async function preview(ctx: PublicContext, formData: FormData) {
	const lines = parseCartPayload(formData.get('cart'));
	const previewKey = previewKeyOf(formData);

	if (lines.length === 0) return { previewKey, preview: null };

	const result = await previewCheckout(ctx, {
		lines,
		fulfillment: readFulfillment(formData.get('fulfillment')),
		location: readLocation(formData)
	});

	return { previewKey, preview: result.ok ? result.data : null };
}

export const actions: Actions = {
	/** Cotiza el pedido completo: domicilio, mínimo y lo que impide pedir. */
	preview: async (event) => preview(publicContext(event), await event.request.formData()),

	order: async (event) => {
		const ctx = publicContext(event);
		const formData = await event.request.formData();
		const lines = parseCartPayload(formData.get('cart'));
		const idempotencyKey = String(formData.get('idempotencyKey') ?? '');

		if (lines.length === 0) {
			return fail(400, { orderError: 'Tu carrito está vacío.', fieldErrors: {} });
		}

		if (!IDEMPOTENCY_KEY.test(idempotencyKey)) {
			return fail(400, {
				orderError: 'Recarga la página e intenta de nuevo.',
				fieldErrors: {}
			});
		}

		const parsed = checkoutFormSchema.safeParse(Object.fromEntries(formData));

		if (!parsed.success) {
			return fail(400, {
				orderError: 'Revisa los datos marcados.',
				fieldErrors: parsed.error.flatten().fieldErrors,
				...(await preview(ctx, formData))
			});
		}

		const form = parsed.data;
		const location =
			form.lat !== undefined && form.lng !== undefined ? { lat: form.lat, lng: form.lng } : null;
		const delivery = form.fulfillment === 'delivery';

		const result = await createOrder(
			ctx,
			{
				lines,
				fulfillment: form.fulfillment,
				location: delivery ? location : null,
				customer: { name: form.name, phone: form.phone },
				address: delivery
					? { text: form.address, neighborhood: form.neighborhood, references: form.references }
					: null,
				payment: {
					method: form.paymentMethod,
					cashTendered: form.paymentMethod === 'cash' ? form.cashTendered : null
				},
				notes: form.notes,
				consent: { service: true, marketing: form.consentMarketing }
			},
			idempotencyKey
		);

		if (!result.ok) {
			const blockers = notOrderableSchema.safeParse(result.details);

			return fail(result.status >= 400 && result.status < 500 ? result.status : 503, {
				orderError: blockers.success
					? (blockers.data.blockers[0] ?? result.message)
					: result.message,
				fieldErrors: result.code === 'invalid_phone' ? { phone: [result.message] } : {},
				...(await preview(ctx, formData))
			});
		}

		redirect(
			303,
			`/${encodeURIComponent(ctx.slug)}/orders/${result.data.number}?token=${encodeURIComponent(result.data.trackingToken)}&new=1`
		);
	}
};
