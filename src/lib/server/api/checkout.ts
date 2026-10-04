import type { CartRequestLine } from '$lib/domain/cart';
import type {
	CheckoutFulfillment,
	CheckoutPreview,
	CreatedOrder,
	PaymentMethod,
	PublicOrder
} from '$lib/domain/checkout';
import type { GeoPoint } from '$lib/domain/menu';
import type { ApiResult } from '$lib/server/api/client';
import type { PublicContext } from '$lib/server/context';

import { z } from 'zod';

import { lineKey } from '$lib/domain/cart';
import { publicRequest } from '$lib/server/api/request';

/**
 * Checkout y seguimiento (`restaurants-api`, módulo `orders`).
 *
 * La API vuelve a evaluar todo al crear el pedido: lo que aquí se cotiza es
 * orientativo hasta que la API lo confirma.
 */

const paymentMethodSchema = z.enum(['cash', 'card_on_delivery']);

const fulfillmentSchema = z.enum(['delivery', 'pickup']);

const previewSchema = z.object({
	lines: z.array(
		z.object({
			index: z.number().int(),
			itemId: z.string(),
			modifierIds: z.array(z.string()),
			name: z.string(),
			modifiersLabel: z.string(),
			note: z.string(),
			qty: z.number().int(),
			unitPrice: z.number().int(),
			total: z.number().int()
		})
	),
	rejected: z.array(z.object({ index: z.number().int(), name: z.string(), reason: z.string() })),
	subtotal: z.number().int(),
	deliveryFee: z.number().int(),
	total: z.number().int(),
	minOrder: z.number().int(),
	distanceKm: z.number().nullable(),
	blockers: z.array(z.string()),
	etaMinutes: z.number().int(),
	paymentMethods: z.array(paymentMethodSchema)
});

const createdSchema = z.object({
	number: z.number().int(),
	trackingToken: z.string(),
	total: z.number().int(),
	etaMinutes: z.number().int()
});

const orderSchema = z.object({
	number: z.number().int(),
	status: z.enum([
		'received',
		'accepted',
		'preparing',
		'ready',
		'dispatched',
		'delivered',
		'picked_up',
		'cancelled',
		'failed_delivery',
		'returned'
	]),
	fulfillment: fulfillmentSchema,
	createdAt: z.string(),
	etaMinutes: z.number().int(),
	restaurant: z.object({ name: z.string(), slug: z.string() }),
	branch: z.object({ name: z.string(), address: z.string() }),
	customerName: z.string(),
	address: z
		.object({ text: z.string(), neighborhood: z.string(), references: z.string() })
		.nullable(),
	items: z.array(
		z.object({
			name: z.string(),
			modifiersLabel: z.string(),
			note: z.string(),
			qty: z.number().int(),
			total: z.number().int()
		})
	),
	totals: z.object({
		subtotal: z.number().int(),
		deliveryFee: z.number().int(),
		total: z.number().int()
	}),
	payment: z.object({ method: paymentMethodSchema, cashTendered: z.number().int().nullable() }),
	notes: z.string()
});

/** Detalle que adjunta la API cuando el pedido no se puede hacer. */
export const notOrderableSchema = z.object({ blockers: z.array(z.string()) });

export interface CheckoutRequest {
	lines: CartRequestLine[];
	fulfillment: CheckoutFulfillment;
	location: GeoPoint | null;
}

export interface OrderRequest extends CheckoutRequest {
	customer: { name: string; phone: string };
	address: { text: string; neighborhood: string; references: string } | null;
	payment: { method: PaymentMethod; cashTendered: number | null };
	notes: string;
	consent: { service: true; marketing: boolean };
}

function checkoutBody(request: CheckoutRequest) {
	return {
		lines: request.lines,
		fulfillment: request.fulfillment,
		...(request.location ? { location: request.location } : {})
	};
}

/** La API responde por posición de línea; aquí cada una recupera la clave del carrito. */
export async function previewCheckout(
	ctx: PublicContext,
	request: CheckoutRequest
): Promise<ApiResult<CheckoutPreview>> {
	const result = await publicRequest(ctx, '/checkout/preview', previewSchema, {
		method: 'POST',
		body: checkoutBody(request)
	});

	if (!result.ok) return result;

	const keyAt = (index: number): string => {
		const line = request.lines[index];

		return line ? lineKey(line.itemId, line.modifierIds, line.note) : `#${index}`;
	};

	return {
		ok: true,
		data: {
			...result.data,
			lines: result.data.lines.map(({ index, ...line }) => ({ ...line, key: keyAt(index) })),
			rejected: result.data.rejected.map(({ index, ...line }) => ({ ...line, key: keyAt(index) }))
		}
	};
}

export function createOrder(
	ctx: PublicContext,
	request: OrderRequest,
	idempotencyKey: string
): Promise<ApiResult<CreatedOrder>> {
	return publicRequest(ctx, '/orders', createdSchema, {
		method: 'POST',
		idempotencyKey,
		body: {
			...checkoutBody(request),
			customer: request.customer,
			...(request.address ? { address: request.address } : {}),
			payment: {
				method: request.payment.method,
				...(request.payment.cashTendered !== null
					? { cashTendered: request.payment.cashTendered }
					: {})
			},
			notes: request.notes,
			consent: request.consent
		}
	});
}

export function trackOrder(
	ctx: PublicContext,
	number: number,
	token: string
): Promise<ApiResult<PublicOrder>> {
	return publicRequest(ctx, `/orders/${number}?token=${encodeURIComponent(token)}`, orderSchema);
}
