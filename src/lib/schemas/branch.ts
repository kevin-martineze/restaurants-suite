import { z } from 'zod';

/** Formulario de configuración de la sede. Los mensajes son los que ve el dueño. */

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora inválida.');

const slotSchema = z.object({
	day: z.number().int().min(0).max(6),
	opens: time,
	closes: time
});

const ringSchema = z.object({
	maxKm: z.number().min(0.1, 'La distancia mínima es 0,1 km.').max(50, 'Máximo 50 km.'),
	fee: z.number().int().min(0, 'El costo no puede ser negativo.'),
	minOrder: z.number().int().min(0, 'El mínimo no puede ser negativo.')
});

const locationSchema = z.object({
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180)
});

/** Un campo que llega como JSON (lo arma el navegador) y se valida acá. */
function fromJson<T>(schema: z.ZodType<T>, message: string): z.ZodType<T, z.ZodTypeDef, string> {
	return z
		.string()
		.transform((raw, ctx) => {
			try {
				return JSON.parse(raw) as unknown;
			} catch {
				ctx.addIssue({ code: z.ZodIssueCode.custom, message });

				return z.NEVER;
			}
		})
		.pipe(schema);
}

export const branchSettingsSchema = z.object({
	name: z.string().trim().min(1, 'Ponle nombre a la sede.').max(120, 'Máximo 120 caracteres.'),
	address: z.string().trim().min(1, 'Escribe la dirección.').max(200, 'Máximo 200 caracteres.'),
	etaMinutes: z.coerce
		.number()
		.int('Escribe un número entero.')
		.min(5, 'Mínimo 5 minutos.')
		.max(240, 'Máximo 240 minutos.'),
	fulfillment: z
		.array(z.enum(['delivery', 'pickup']))
		.min(1, 'Elige al menos una forma de entrega.'),
	schedule: fromJson(z.array(slotSchema).max(28, 'Máximo 28 turnos.'), 'Horario inválido.'),
	location: z.string().transform((raw, ctx) => {
		if (raw === '') return null;

		try {
			return locationSchema.parse(JSON.parse(raw) as unknown);
		} catch {
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ubicación inválida.' });

			return z.NEVER;
		}
	}),
	deliveryRings: fromJson(z.array(ringSchema).max(5, 'Máximo 5 anillos.'), 'Anillos inválidos.'),
	paymentMethods: z
		.array(z.enum(['cash', 'card_on_delivery']))
		.min(1, 'Elige al menos un medio de pago.')
});
