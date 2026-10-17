import type { BranchSettings } from '$lib/domain/branch';
import type { ApiResult } from '$lib/server/api/client';
import type { PanelContext } from '$lib/server/context';

import { z } from 'zod';

import { panelRequest } from '$lib/server/api/request';

/** Configuración de la sede (`restaurants-api`, panel). */

const slotSchema = z.object({ day: z.number().int(), opens: z.string(), closes: z.string() });
const ringSchema = z.object({
	maxKm: z.number(),
	fee: z.number().int(),
	minOrder: z.number().int()
});

const branchSettingsSchema = z.object({
	name: z.string(),
	address: z.string(),
	schedule: z.array(slotSchema),
	etaMinutes: z.number().int(),
	fulfillment: z.array(z.enum(['delivery', 'pickup'])),
	location: z.object({ lat: z.number(), lng: z.number() }).nullable(),
	deliveryRings: z.array(ringSchema),
	paymentMethods: z.array(z.enum(['cash', 'card_on_delivery']))
});

export function branchSettings(ctx: PanelContext): Promise<ApiResult<BranchSettings>> {
	return panelRequest(
		ctx,
		`/branches/${encodeURIComponent(ctx.branchId)}/settings`,
		branchSettingsSchema
	);
}

export function updateBranchSettings(
	ctx: PanelContext,
	settings: BranchSettings
): Promise<ApiResult<BranchSettings>> {
	return panelRequest(
		ctx,
		`/branches/${encodeURIComponent(ctx.branchId)}/settings`,
		branchSettingsSchema,
		{ method: 'PUT', body: settings }
	);
}
