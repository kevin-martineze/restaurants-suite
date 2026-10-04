import { describe, expect, it } from 'vitest';

import { checkoutFormSchema, isColombianMobile } from '$lib/schemas/checkout';

const base = {
	fulfillment: 'delivery',
	name: 'Ana Pérez',
	phone: '300 123 4567',
	address: 'Calle 76 #54-30',
	neighborhood: 'Alto Prado',
	references: '',
	lat: '11.0035',
	lng: '-74.8155',
	paymentMethod: 'cash',
	cashTendered: '$50.000',
	notes: '',
	consentService: 'on'
};

describe('isColombianMobile', () => {
	it('acepta celulares con o sin indicativo', () => {
		expect(isColombianMobile('300 123 4567')).toBe(true);
		expect(isColombianMobile('+57 300-123-4567')).toBe(true);
		expect(isColombianMobile('605 345 6789')).toBe(false);
	});
});

describe('checkoutFormSchema', () => {
	it('lee un domicilio completo', () => {
		const result = checkoutFormSchema.parse(base);

		expect(result).toMatchObject({
			lat: 11.0035,
			lng: -74.8155,
			cashTendered: 50000,
			consentMarketing: false
		});
	});

	it('para domicilio exige dirección y punto en el mapa', () => {
		const result = checkoutFormSchema.safeParse({ ...base, address: '', lat: undefined });

		expect(result.success).toBe(false);
		if (result.success) return;

		expect(result.error.flatten().fieldErrors).toMatchObject({
			address: ['Escribe la dirección de entrega.'],
			lat: ['Marca en el mapa dónde te entregamos.']
		});
	});

	it('para recoger no pide dirección', () => {
		const result = checkoutFormSchema.safeParse({
			...base,
			fulfillment: 'pickup',
			address: '',
			lat: undefined,
			lng: undefined
		});

		expect(result.success).toBe(true);
	});

	it('sin autorización no hay pedido', () => {
		const result = checkoutFormSchema.safeParse({ ...base, consentService: undefined });

		expect(result.success).toBe(false);
	});

	it('el efectivo vacío es pagar exacto', () => {
		expect(checkoutFormSchema.parse({ ...base, cashTendered: '' }).cashTendered).toBeNull();
	});
});
