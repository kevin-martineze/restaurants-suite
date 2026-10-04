import type { Cookies } from '@sveltejs/kit';
import type { PanelSession } from '$lib/domain/staff';

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

import { z } from 'zod';

import { serverEnv } from '$lib/server/env';

/**
 * La sesión del panel, en una cookie cifrada con AES-256-GCM.
 *
 * El navegador no puede leerla ni alterarla: guarda el token de la API, que
 * nunca debe llegar al JavaScript de la página. Si alguien la toca, el
 * descifrado falla y la sesión simplemente no existe.
 */

export const SESSION_COOKIE = 'restaurante_sesion';

const sessionSchema = z.object({
	accessToken: z.string(),
	expiresAt: z.string(),
	user: z.object({ id: z.string(), name: z.string(), email: z.string() }),
	memberships: z.array(
		z.object({
			tenantId: z.string(),
			tenantName: z.string(),
			role: z.enum(['owner', 'manager', 'cashier', 'kitchen', 'rider']),
			brands: z.array(z.object({ id: z.string(), name: z.string(), slug: z.string() })),
			branches: z.array(z.object({ id: z.string(), name: z.string() }))
		})
	),
	tenantId: z.string(),
	branchId: z.string()
});

function key(): Buffer {
	return createHash('sha256').update(serverEnv().SESSION_SECRET).digest();
}

export function seal(session: PanelSession): string {
	const iv = randomBytes(12);
	const cipher = createCipheriv('aes-256-gcm', key(), iv);
	const encrypted = Buffer.concat([cipher.update(JSON.stringify(session), 'utf8'), cipher.final()]);

	return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.');
}

export function unseal(value: string): PanelSession | null {
	const [iv, tag, encrypted] = value.split('.').map((part) => Buffer.from(part, 'base64url'));

	if (!iv || !tag || !encrypted) return null;

	try {
		const decipher = createDecipheriv('aes-256-gcm', key(), iv);

		decipher.setAuthTag(tag);

		const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
		const parsed = sessionSchema.safeParse(JSON.parse(plain));

		return parsed.success ? parsed.data : null;
	} catch {
		return null;
	}
}

/** La sesión vigente, o null si no hay, está alterada o ya venció. */
export function readSession(cookies: Cookies, now = new Date()): PanelSession | null {
	const raw = cookies.get(SESSION_COOKIE);
	const session = raw ? unseal(raw) : null;

	if (!session || new Date(session.expiresAt) <= now) return null;

	return session;
}

export function writeSession(cookies: Cookies, session: PanelSession, secure: boolean): void {
	cookies.set(SESSION_COOKIE, seal(session), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure,
		expires: new Date(session.expiresAt)
	});
}

export function clearSession(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}
