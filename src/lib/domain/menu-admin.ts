import type { ItemTag } from '$lib/domain/menu';

/** La carta como la edita el panel: con lo inactivo y lo agotado. */

export type CategoryRole = 'main' | 'side' | 'drink' | 'dessert';

export const CATEGORY_ROLE_LABEL: Record<CategoryRole, string> = {
	main: 'Platos principales',
	side: 'Acompañantes',
	drink: 'Bebidas',
	dessert: 'Postres'
};

export const CATEGORY_ROLES: CategoryRole[] = ['main', 'side', 'drink', 'dessert'];

export const ITEM_TAGS: ItemTag[] = ['popular', 'new', 'spicy', 'vegetarian'];

export interface AdminItem {
	id: string;
	categoryId: string;
	name: string;
	description: string | null;
	price: number;
	imageUrl: string | null;
	available: boolean;
	tags: ItemTag[];
	modifierGroupIds: string[];
	pairsWith: string[];
}

export interface AdminCategory {
	id: string;
	name: string;
	role: CategoryRole;
	active: boolean;
	items: AdminItem[];
}

export interface AdminModifier {
	id: string;
	name: string;
	priceDelta: number;
	available: boolean;
}

export interface AdminGroup {
	id: string;
	name: string;
	min: number;
	max: number;
	modifiers: AdminModifier[];
	usedBy: number;
}

export interface AdminMenu {
	brand: { id: string; name: string; slug: string };
	categories: AdminCategory[];
	groups: AdminGroup[];
}

/** Un grupo en edición: las opciones nuevas todavía no tienen id. */
export interface GroupDraft {
	id: string | null;
	name: string;
	min: number;
	max: number;
	modifiers: { id: string | null; name: string; priceDelta: number; available: boolean }[];
}

/** La regla del grupo en palabras, para la lista: "Elige 1 · obligatorio". */
export function groupSummary(group: Pick<AdminGroup, 'min' | 'max'>): string {
	if (group.min === 0) return group.max === 1 ? 'Opcional · 1' : `Opcional · hasta ${group.max}`;
	if (group.min === group.max) return `Obligatorio · ${group.min}`;

	return `Obligatorio · ${group.min} a ${group.max}`;
}

/** "1 producto", "3 productos". */
export function productsLabel(count: number): string {
	return `${count} ${count === 1 ? 'producto' : 'productos'}`;
}

/** Mover un elemento una posición arriba (-1) o abajo (+1) en una lista de ids. */
export function moveId(ids: readonly string[], id: string, direction: -1 | 1): string[] {
	const index = ids.indexOf(id);
	const target = index + direction;

	if (index < 0 || target < 0 || target >= ids.length) return [...ids];

	const next = [...ids];
	const [moved] = next.splice(index, 1);

	if (moved !== undefined) next.splice(target, 0, moved);

	return next;
}
