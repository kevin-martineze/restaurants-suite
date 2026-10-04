import type { OrderStatus } from '$lib/domain/checkout';
import type { BranchLive, BranchStatus, CancelReason, StaffOrder } from '$lib/domain/panel';
import type { KitchenLoad } from '$lib/domain/menu';
import type { ApiResult } from '$lib/server/api/client';
import type { PanelContext } from '$lib/server/context';

import { z } from 'zod';

import { panelRequest } from '$lib/server/api/request';

/** Tablero, pedidos y sede en vivo (`restaurants-api`, panel). */

const orderStatusSchema = z.enum([
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
]);

const staffOrderSchema = z.object({
	id: z.string(),
	number: z.number().int(),
	status: orderStatusSchema,
	fulfillment: z.enum(['delivery', 'pickup']),
	createdAt: z.string(),
	etaMinutes: z.number().int(),
	customer: z.object({ name: z.string(), phone: z.string() }),
	address: z
		.object({
			text: z.string(),
			neighborhood: z.string(),
			references: z.string(),
			lat: z.number(),
			lng: z.number(),
			distanceKm: z.number()
		})
		.nullable(),
	items: z.array(
		z.object({
			name: z.string(),
			modifiers: z.array(z.object({ groupName: z.string(), name: z.string() })),
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
	payment: z.object({
		method: z.enum(['cash', 'card_on_delivery']),
		status: z.enum(['pending', 'collected', 'refunded']),
		cashTendered: z.number().int().nullable(),
		change: z.number().int()
	}),
	notes: z.string(),
	events: z.array(
		z.object({
			status: orderStatusSchema,
			at: z.string(),
			actorRole: z.string(),
			reason: z.string().nullable()
		})
	)
});

const branchLiveSchema = z.object({
	id: z.string(),
	name: z.string(),
	status: z.enum(['open', 'paused', 'closed']),
	kitchen: z.object({
		load: z.enum(['calm', 'busy', 'saturated']),
		label: z.string(),
		etaMinutes: z.number().int()
	})
});

export function activeOrders(ctx: PanelContext): Promise<ApiResult<StaffOrder[]>> {
	return panelRequest(
		ctx,
		`/branches/${encodeURIComponent(ctx.branchId)}/orders`,
		z.array(staffOrderSchema)
	);
}

export function moveOrder(
	ctx: PanelContext,
	orderId: string,
	to: OrderStatus,
	reason: CancelReason | null
): Promise<ApiResult<StaffOrder>> {
	return panelRequest(ctx, `/orders/${encodeURIComponent(orderId)}/transitions`, staffOrderSchema, {
		method: 'POST',
		body: { to, ...(reason ? { reason } : {}) }
	});
}

export function branchLive(ctx: PanelContext): Promise<ApiResult<BranchLive>> {
	return panelRequest(ctx, `/branches/${encodeURIComponent(ctx.branchId)}`, branchLiveSchema);
}

export function updateBranchLive(
	ctx: PanelContext,
	changes: { status?: Extract<BranchStatus, 'open' | 'paused'>; kitchenLoad?: KitchenLoad }
): Promise<ApiResult<BranchLive>> {
	return panelRequest(ctx, `/branches/${encodeURIComponent(ctx.branchId)}`, branchLiveSchema, {
		method: 'PATCH',
		body: changes
	});
}

/** La URL del stream de avisos en la API, para el proxy SSE del panel. */
export function orderEventsPath(ctx: PanelContext): string {
	return `/tenants/${encodeURIComponent(ctx.tenantId)}/branches/${encodeURIComponent(ctx.branchId)}/orders/events`;
}
