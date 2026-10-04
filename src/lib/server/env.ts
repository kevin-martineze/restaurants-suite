import { z } from 'zod';

import { env as privateEnv } from '$env/dynamic/private';

/**
 * Entorno del servidor.
 *
 * Se valida en tiempo de ejecución (no de build) para que el proyecto arranque
 * y muestre un error legible cuando falta configuración.
 */
const schema = z.object({
	/** API propia con su prefijo de versión. Se guarda sin barra final. */
	API_URL: z
		.string()
		.url()
		.default('http://localhost:3100/v1')
		.transform((value) => value.replace(/\/+$/, ''))
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
	if (cached) return cached;

	const parsed = schema.safeParse({
		API_URL: privateEnv.API_URL === '' ? undefined : privateEnv.API_URL
	});

	if (!parsed.success) {
		const problems = parsed.error.issues
			.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
			.join('; ');

		throw new Error(`Variables de entorno inválidas: ${problems}`);
	}

	cached = parsed.data;

	return cached;
}
