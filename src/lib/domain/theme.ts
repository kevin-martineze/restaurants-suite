import type { MenuTheme } from '$lib/domain/menu';

/**
 * Colores de la plantilla del restaurante como variables CSS.
 *
 * Pisan los tokens `--primary` y `--primary-foreground` solo dentro de la
 * carta, así los componentes siguen usando `bg-primary` y nunca un color
 * escrito a mano.
 *
 * El valor termina en un atributo `style`, así que se acepta solo un color con
 * formato conocido: un hex o un `oklch(...)` con números. Cualquier otra cosa
 * cae al token de la plataforma en vez de inyectar CSS.
 */
const COLOR = /^(#[0-9a-f]{3,8}|oklch\(\s*[\d.]+%?\s+[\d.]+\s+[\d.]+(\s*\/\s*[\d.]+%?)?\s*\))$/i;

export function isSafeColor(value: string): boolean {
	return COLOR.test(value.trim());
}

export function themeStyle(theme: MenuTheme): string {
	const declarations: string[] = [];

	if (isSafeColor(theme.primary)) {
		declarations.push(`--primary: ${theme.primary.trim()}`, `--ring: ${theme.primary.trim()}`);
	}

	if (isSafeColor(theme.primaryForeground)) {
		declarations.push(`--primary-foreground: ${theme.primaryForeground.trim()}`);
	}

	return declarations.join('; ');
}
