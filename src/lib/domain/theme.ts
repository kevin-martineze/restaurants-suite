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

const FOREGROUND_LIGHT = 'oklch(1 0 0)';
const FOREGROUND_DARK = 'oklch(0.2 0 0)';
/** Luminancia relativa (WCAG) de `oklch(0.2 0 0)`, el casi negro del texto. */
const DARK_LUMINANCE = 0.008;

/**
 * El texto que se lee sobre el color primario: blanco o casi negro.
 *
 * Es la misma regla que la API aplica al guardar, así la vista previa no
 * muestra un color con un texto que luego cambia. Solo entiende hex (el
 * selector y los sugeridos siempre son hex); un oklch cae al blanco y el valor
 * guardado, que sí viene calculado por la API, manda.
 */
export function primaryForeground(primary: string): string {
	const luminance = hexLuminance(primary);

	if (luminance === null) return FOREGROUND_LIGHT;

	const light = 1.05 / (luminance + 0.05);
	const dark = (luminance + 0.05) / (DARK_LUMINANCE + 0.05);

	return light >= dark ? FOREGROUND_LIGHT : FOREGROUND_DARK;
}

function hexLuminance(hex: string): number | null {
	const value = hex.trim().replace('#', '');
	if (!/^[0-9a-f]{3,8}$/i.test(value)) return null;

	const full =
		value.length === 3 || value.length === 4
			? value
					.split('')
					.slice(0, 3)
					.map((channel) => channel + channel)
					.join('')
			: value;

	const red = parseInt(full.slice(0, 2), 16);
	const green = parseInt(full.slice(2, 4), 16);
	const blue = parseInt(full.slice(4, 6), 16);

	return (
		channelLuminance(red / 255) * 0.2126 +
		channelLuminance(green / 255) * 0.7152 +
		channelLuminance(blue / 255) * 0.0722
	);
}

function channelLuminance(channel: number): number {
	return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
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
