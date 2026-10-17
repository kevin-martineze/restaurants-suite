import { z } from 'zod';

import { isSafeColor } from '$lib/domain/theme';

/** Formulario de la marca. Los mensajes son los que ve el dueño. */

export const brandSettingsSchema = z.object({
	name: z.string().trim().min(1, 'Ponle nombre a la marca.').max(120, 'Máximo 120 caracteres.'),
	tagline: z
		.string()
		.trim()
		.max(160, 'Máximo 160 caracteres.')
		.transform((value) => value || null),
	primary: z
		.string()
		.trim()
		.min(1, 'Elige un color.')
		.max(64, 'Color inválido.')
		.refine(isSafeColor, 'Elige un color válido: un hex o un oklch numérico.')
});
