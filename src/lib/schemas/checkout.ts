import { z } from 'zod';

/**
 * El formulario del checkout, validado en el servidor de la carta antes de
 * llamar a la API. Los mensajes son los que ve el cliente.
 */

const optionalText = (max: number) =>
	z.string().trim().max(max, `Máximo ${max} caracteres.`).default('');

/** Celular colombiano: 10 dígitos que empiezan por 3, con o sin +57 y espacios. */
export function isColombianMobile(raw: string): boolean {
	let digits = raw.replace(/\D/g, '');

	if (digits.length === 12 && digits.startsWith('57')) digits = digits.slice(2);

	return /^3\d{9}$/.test(digits);
}

const coordinate = z.coerce.number().finite();

export const checkoutFormSchema = z
	.object({
		fulfillment: z.enum(['delivery', 'pickup'], {
			errorMap: () => ({ message: 'Elige si es domicilio o para recoger.' })
		}),
		name: z.string().trim().min(2, 'Escribe tu nombre.').max(80, 'El nombre es muy largo.'),
		phone: z
			.string()
			.trim()
			.refine(isColombianMobile, 'Escribe un celular de 10 dígitos, como 300 123 4567.'),
		address: optionalText(200),
		neighborhood: optionalText(80),
		references: optionalText(200),
		lat: coordinate.optional(),
		lng: coordinate.optional(),
		paymentMethod: z.enum(['cash', 'card_on_delivery'], {
			errorMap: () => ({ message: 'Elige cómo vas a pagar.' })
		}),
		cashTendered: z
			.string()
			.trim()
			.default('')
			.transform((value) => (value === '' ? null : Number(value.replace(/\D/g, ''))))
			.refine((value) => value === null || Number.isInteger(value), 'Escribe un monto válido.'),
		notes: optionalText(280),
		consentService: z.literal('on', {
			errorMap: () => ({ message: 'Necesitamos tu autorización para gestionar el pedido.' })
		}),
		consentMarketing: z
			.literal('on')
			.optional()
			.transform((value) => value === 'on')
	})
	.superRefine((form, ctx) => {
		if (form.fulfillment !== 'delivery') return;

		if (form.address.length < 5) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['address'],
				message: 'Escribe la dirección de entrega.'
			});
		}

		if (form.lat === undefined || form.lng === undefined) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['lat'],
				message: 'Marca en el mapa dónde te entregamos.'
			});
		}
	});

export type CheckoutForm = z.infer<typeof checkoutFormSchema>;
