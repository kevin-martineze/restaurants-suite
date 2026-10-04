import type { CheckoutFulfillment, OrderStatus, PaymentMethod } from '$lib/domain/checkout';
import type { KitchenLoad } from '$lib/domain/menu';

/** El pedido como lo ve el equipo: con teléfono, coordenadas e historial. */
export interface StaffOrder {
	id: string;
	number: number;
	status: OrderStatus;
	fulfillment: CheckoutFulfillment;
	createdAt: string;
	etaMinutes: number;
	customer: { name: string; phone: string };
	address: {
		text: string;
		neighborhood: string;
		references: string;
		lat: number;
		lng: number;
		distanceKm: number;
	} | null;
	items: {
		name: string;
		modifiers: { groupName: string; name: string }[];
		note: string;
		qty: number;
		total: number;
	}[];
	totals: { subtotal: number; deliveryFee: number; total: number };
	payment: {
		method: PaymentMethod;
		status: 'pending' | 'collected' | 'refunded';
		cashTendered: number | null;
		change: number;
	};
	notes: string;
	events: { status: OrderStatus; at: string; actorRole: string; reason: string | null }[];
}

export type BranchStatus = 'open' | 'paused' | 'closed';

export interface BranchLive {
	id: string;
	name: string;
	status: BranchStatus;
	kitchen: { load: KitchenLoad; label: string; etaMinutes: number };
}

export type CancelReason = 'customer' | 'out_of_stock' | 'out_of_coverage' | 'restaurant' | 'other';

export const CANCEL_REASONS: CancelReason[] = [
	'customer',
	'out_of_stock',
	'out_of_coverage',
	'restaurant',
	'other'
];

export const CANCEL_REASON_LABEL: Record<CancelReason, string> = {
	customer: 'El cliente lo canceló',
	out_of_stock: 'Se nos agotó algo',
	out_of_coverage: 'No llegamos a esa dirección',
	restaurant: 'No podemos prepararlo ahora',
	other: 'Otro motivo'
};

export const KITCHEN_LOAD_LABEL: Record<KitchenLoad, string> = {
	calm: 'Al día',
	busy: 'Mucha demanda',
	saturated: 'A tope'
};

/** Las columnas del tablero y qué estados caen en cada una. */
export const BOARD_COLUMNS: { id: string; title: string; statuses: OrderStatus[] }[] = [
	{ id: 'new', title: 'Nuevos', statuses: ['received'] },
	{ id: 'kitchen', title: 'En cocina', statuses: ['accepted', 'preparing'] },
	{ id: 'ready', title: 'Listos', statuses: ['ready'] },
	{ id: 'on-the-way', title: 'En camino', statuses: ['dispatched', 'failed_delivery'] }
];

/** Un pedido que lleva más que esto sin aceptar está esperando de más. */
export const ACCEPT_ALERT_MINUTES = 3;

/** El paso siguiente del pedido: el botón grande de su tarjeta. */
export function primaryAction(order: Pick<StaffOrder, 'status' | 'fulfillment'>): {
	to: OrderStatus;
	label: string;
} | null {
	switch (order.status) {
		case 'received':
			return { to: 'accepted', label: 'Aceptar' };
		case 'accepted':
			return { to: 'preparing', label: 'Empezar a preparar' };
		case 'preparing':
			return { to: 'ready', label: 'Marcar listo' };
		case 'ready':
			return order.fulfillment === 'delivery'
				? { to: 'dispatched', label: 'Despachar' }
				: { to: 'picked_up', label: 'Entregado al cliente' };
		case 'dispatched':
			return { to: 'delivered', label: 'Entregado' };
		case 'failed_delivery':
			return { to: 'dispatched', label: 'Reintentar entrega' };
		default:
			return null;
	}
}

/** Minutos desde que llegó el pedido. */
export function minutesSince(iso: string, now: Date): number {
	return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 60000));
}

/** "ahora", "hace 4 min", "hace 1 h 5 min". */
export function elapsedLabel(minutes: number): string {
	if (minutes < 1) return 'ahora';
	if (minutes < 60) return `hace ${minutes} min`;

	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;

	return rest === 0 ? `hace ${hours} h` : `hace ${hours} h ${rest} min`;
}

/** Enlace de WhatsApp al cliente (el teléfono llega en E.164). */
export function whatsappLink(phone: string, text: string): string {
	return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

/** Abrir el punto exacto en la app de mapas del celular del domiciliario. */
export function mapsLinks(lat: number, lng: number): { google: string; waze: string } {
	return {
		google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
		waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
	};
}
