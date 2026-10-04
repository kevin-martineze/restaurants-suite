import { z } from 'zod';

export const loginSchema = z.object({
	email: z.string().trim().email('Escribe un correo válido.'),
	password: z.string().min(1, 'Escribe tu contraseña.')
});
