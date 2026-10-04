import type { QuotedLine, RejectedLine } from '$lib/domain/cart';
import type { GeoPoint } from '$lib/domain/menu';

/**
 * El checkout: lo que se pide, cómo se entrega y cómo se paga.
 *
 * Los estados y métodos se guardan en inglés (como en la API) y se traducen
 * aquí, al pintarlos.
 */

export type CheckoutFulfillment = 'delivery' | 'pickup';

export type PaymentMethod = 'cash' | 'card_on_delivery';

export type OrderStatus =
	| 'received'
	| 'accepted'
	| 'preparing'
	| 'ready'
	| 'dispatched'
	| 'delivered'
	| 'picked_up'
	| 'cancelled'
	| 'failed_delivery'
	| 'returned';

export const FULFILLMENT_OPTION_LABEL: Record<CheckoutFulfillment, string> = {
	delivery: 'Domicilio',
	pickup: 'Recoger en el local'
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
	cash: 'Efectivo',
	card_on_delivery: 'Tarjeta con datáfono'
};

export const PAYMENT_METHOD_HINT: Record<PaymentMethod, string> = {
	cash: 'Pagas al recibir. Te llevamos el cambio.',
	card_on_delivery: 'Pagas con débito o crédito al recibir.'
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
	received: 'Recibido',
	accepted: 'Aceptado',
	preparing: 'En cocina',
	ready: 'Listo',
	dispatched: 'En camino',
	delivered: 'Entregado',
	picked_up: 'Recogido',
	cancelled: 'Cancelado',
	failed_delivery: 'No se pudo entregar',
	returned: 'Devuelto al local'
};

export interface CheckoutPreview {
	lines: QuotedLine[];
	rejected: RejectedLine[];
	subtotal: number;
	deliveryFee: number;
	total: number;
	minOrder: number;
	distanceKm: number | null;
	/** Lo que impide pedir, en español, en el orden en que se resuelve. */
	blockers: string[];
	etaMinutes: number;
	paymentMethods: PaymentMethod[];
}

export interface CreatedOrder {
	number: number;
	trackingToken: string;
	total: number;
	etaMinutes: number;
}

export interface PublicOrder {
	number: number;
	status: OrderStatus;
	fulfillment: CheckoutFulfillment;
	createdAt: string;
	etaMinutes: number;
	restaurant: { name: string; slug: string };
	branch: { name: string; address: string };
	customerName: string;
	address: { text: string; neighborhood: string; references: string } | null;
	items: { name: string; modifiersLabel: string; note: string; qty: number; total: number }[];
	totals: { subtotal: number; deliveryFee: number; total: number };
	payment: { method: PaymentMethod; cashTendered: number | null };
	notes: string;
}

/** Lo que el cliente deja guardado en su celular para el próximo pedido. */
export interface SavedCheckout {
	name: string;
	phone: string;
	address: string;
	neighborhood: string;
	references: string;
	location: GeoPoint | null;
}

/**
 * Billetes con los que se suele pagar un total: los primeros montos
 * redondos por encima. Para $39.000 → $40.000, $50.000, $100.000.
 */
export function cashSuggestions(total: number): number[] {
	const steps = [10000, 20000, 50000, 100000];
	const options = new Set<number>();

	for (const step of steps) {
		const rounded = Math.ceil(total / step) * step;

		if (rounded > total) options.add(rounded);
	}

	return [...options].sort((a, b) => a - b).slice(0, 3);
}

/** El cambio que lleva el domiciliario. */
export function changeFor(total: number, tendered: number | null): number {
	return tendered === null ? 0 : Math.max(tendered - total, 0);
}
