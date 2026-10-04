import type { PanelSession } from '$lib/domain/staff';

import { describe, expect, it, vi } from 'vitest';

import { seal, unseal } from '$lib/server/session';

vi.mock('$lib/server/env', () => ({
	serverEnv: () => ({
		API_URL: 'http://localhost:3100/v1',
		SESSION_SECRET: 'secreto-de-pruebas-de-la-sesion-del-panel'
	})
}));

const session: PanelSession = {
	accessToken: 'token',
	expiresAt: '2026-10-05T02:00:00.000Z',
	user: { id: 'u1', name: 'Caja', email: 'caja@laparrilla.test' },
	memberships: [
		{
			tenantId: 't1',
			tenantName: 'La Parrilla de Toño',
			role: 'cashier',
			brands: [{ id: 'b1', name: 'La Parrilla de Toño', slug: 'la-parrilla-de-tono' }],
			branches: [{ id: 's1', name: 'Sede El Prado' }]
		}
	],
	tenantId: 't1',
	branchId: 's1'
};

describe('sesión cifrada', () => {
	it('lo que se sella se puede abrir', () => {
		expect(unseal(seal(session))).toEqual(session);
	});

	it('no se puede leer: el token no aparece en la cookie', () => {
		expect(seal(session)).not.toContain('token');
		expect(seal(session)).not.toContain('Caja');
	});

	it('una cookie alterada no es una sesión', () => {
		const sealed = seal(session);
		const [iv, tag, data] = sealed.split('.');
		const tampered = [iv, tag, `${data?.slice(0, -2)}AA`].join('.');

		expect(unseal(tampered)).toBeNull();
		expect(unseal('basura')).toBeNull();
	});
});
