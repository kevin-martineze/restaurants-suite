/** El equipo del restaurante, como lo conoce el panel. */

export type Role = 'owner' | 'manager' | 'cashier' | 'kitchen' | 'rider';

export const ROLE_LABEL: Record<Role, string> = {
	owner: 'Dueño',
	manager: 'Gerente',
	cashier: 'Caja',
	kitchen: 'Cocina',
	rider: 'Domicilios'
};

export function isRole(value: string): value is Role {
	return value in ROLE_LABEL;
}

/** Quién hizo un cambio, en palabras: "cliente", "Caja", "Cocina"… */
export function actorLabel(actorRole: string): string {
	if (actorRole === 'customer') return 'cliente';

	return isRole(actorRole) ? ROLE_LABEL[actorRole] : actorRole;
}

export interface StaffMembership {
	tenantId: string;
	tenantName: string;
	role: Role;
	brands: { id: string; name: string; slug: string }[];
	branches: { id: string; name: string }[];
}

/** Lo que vive en la cookie cifrada del panel. */
export interface PanelSession {
	accessToken: string;
	/** ISO. Después de esto la sesión no vale. */
	expiresAt: string;
	user: { id: string; name: string; email: string };
	memberships: StaffMembership[];
	/** Dónde está trabajando ahora. */
	tenantId: string;
	branchId: string;
}

/** Quién mueve el pedido a cada estado. Espejo de la regla de la API, solo para no mostrar botones inútiles. */
export function canMoveTo(role: Role, to: string): boolean {
	const managers: Role[] = ['owner', 'manager', 'cashier'];

	switch (to) {
		case 'preparing':
		case 'ready':
			return [...managers, 'kitchen'].includes(role);
		case 'dispatched':
		case 'delivered':
		case 'failed_delivery':
			return [...managers, 'rider'].includes(role);
		default:
			return managers.includes(role);
	}
}
