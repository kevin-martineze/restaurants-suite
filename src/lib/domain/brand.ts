import type { MenuTheme } from '$lib/domain/menu';

/**
 * La marca tal como la edita el dueño o el gerente en `/dashboard/brand`.
 *
 * Es la forma que conoce la página. Venga de la API o de fixtures,
 * `$lib/server/api/` la traduce a esto.
 */
export interface BrandSettings {
	/** La URL de la carta: no se edita, es el mismo `/{slug}` de los QR. */
	slug: string;
	name: string;
	tagline: string | null;
	theme: MenuTheme;
	logoUrl: string | null;
	coverUrl: string | null;
}
