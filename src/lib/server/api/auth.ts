import type { StaffMembership } from '$lib/domain/staff';
import type { ApiResult } from '$lib/server/api/client';

import { z } from 'zod';

import { apiRequest } from '$lib/server/api/client';

/** Acceso del equipo (`restaurants-api`, módulo `auth`). */

const membershipSchema = z.object({
	tenantId: z.string(),
	tenantName: z.string(),
	role: z.enum(['owner', 'manager', 'cashier', 'kitchen', 'rider']),
	brands: z.array(z.object({ id: z.string(), name: z.string(), slug: z.string() })),
	branches: z.array(z.object({ id: z.string(), name: z.string() }))
});

const loginSchema = z.object({
	accessToken: z.string(),
	expiresAt: z.string(),
	user: z.object({ id: z.string(), name: z.string(), email: z.string() }),
	memberships: z.array(membershipSchema)
});

export interface LoginResult {
	accessToken: string;
	expiresAt: string;
	user: { id: string; name: string; email: string };
	memberships: StaffMembership[];
}

export function login(
	email: string,
	password: string,
	clientIp: string | null
): Promise<ApiResult<LoginResult>> {
	return apiRequest('/auth/login', loginSchema, {
		method: 'POST',
		body: { email, password },
		clientIp
	});
}
