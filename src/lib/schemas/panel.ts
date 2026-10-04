import { z } from 'zod';

const orderStatus = z.enum([
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

export const moveOrderSchema = z.object({
	orderId: z.string().min(1).max(64),
	to: orderStatus,
	reason: z.enum(['customer', 'out_of_stock', 'out_of_coverage', 'restaurant', 'other']).optional()
});

export const branchLiveSchema = z
	.object({
		status: z.enum(['open', 'paused']).optional(),
		kitchenLoad: z.enum(['calm', 'busy', 'saturated']).optional()
	})
	.refine((value) => value.status !== undefined || value.kitchenLoad !== undefined, {
		message: 'No hay nada que cambiar.'
	});
