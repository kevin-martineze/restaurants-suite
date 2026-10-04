import { describe, expect, it } from 'vitest';

import {
	elapsedLabel,
	mapsLinks,
	minutesSince,
	primaryAction,
	whatsappLink
} from '$lib/domain/panel';
import { canMoveTo } from '$lib/domain/staff';

describe('primaryAction', () => {
	it('propone el siguiente paso según el estado y la entrega', () => {
		expect(primaryAction({ status: 'received', fulfillment: 'delivery' })?.to).toBe('accepted');
		expect(primaryAction({ status: 'ready', fulfillment: 'delivery' })?.to).toBe('dispatched');
		expect(primaryAction({ status: 'ready', fulfillment: 'pickup' })?.to).toBe('picked_up');
		expect(primaryAction({ status: 'delivered', fulfillment: 'delivery' })).toBeNull();
	});
});

describe('tiempos', () => {
	it('cuenta minutos y los dice en palabras', () => {
		const now = new Date('2026-10-04T15:10:00Z');

		expect(minutesSince('2026-10-04T15:06:30Z', now)).toBe(3);
		expect(elapsedLabel(0)).toBe('ahora');
		expect(elapsedLabel(4)).toBe('hace 4 min');
		expect(elapsedLabel(65)).toBe('hace 1 h 5 min');
		expect(elapsedLabel(120)).toBe('hace 2 h');
	});
});

describe('enlaces', () => {
	it('arma WhatsApp y mapas', () => {
		expect(whatsappLink('+573001234567', 'Hola')).toBe('https://wa.me/573001234567?text=Hola');
		expect(mapsLinks(11.0035, -74.8155).waze).toBe(
			'https://waze.com/ul?ll=11.0035,-74.8155&navigate=yes'
		);
	});
});

describe('canMoveTo', () => {
	it('esconde los botones que el rol no puede usar', () => {
		expect(canMoveTo('kitchen', 'ready')).toBe(true);
		expect(canMoveTo('kitchen', 'accepted')).toBe(false);
		expect(canMoveTo('rider', 'delivered')).toBe(true);
		expect(canMoveTo('cashier', 'cancelled')).toBe(true);
	});
});
