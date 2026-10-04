/**
 * La carta tal como la ve el cliente.
 *
 * Es la forma que conocen las páginas. Venga de fixtures o de la API, el
 * archivo de `$lib/server/api/` la traduce a esto, así un cambio en la API no
 * toca ningún componente.
 *
 * Todo precio es un entero en pesos: COP no usa decimales.
 */

export interface Modifier {
	id: string;
	name: string;
	/** Lo que suma al precio del producto. Puede ser 0 ("Rosada"). */
	priceDelta: number;
	available: boolean;
}

/**
 * Un grupo de opciones ("Salsas", "Término de la carne").
 *
 * No es un producto cartesiano como talla × color: cada grupo se elige por
 * separado, con su mínimo y su máximo. Obligatorio es `min ≥ 1`.
 */
export interface ModifierGroup {
	id: string;
	name: string;
	min: number;
	max: number;
	modifiers: Modifier[];
}

/** Etiquetas con las que el restaurante destaca un producto. */
export type ItemTag = 'popular' | 'new' | 'spicy' | 'vegetarian';

export const ITEM_TAG_LABEL: Record<ItemTag, string> = {
	popular: 'Más pedido',
	new: 'Nuevo',
	spicy: 'Picante',
	vegetarian: 'Vegetariano'
};

export interface Item {
	id: string;
	name: string;
	description: string | null;
	/** Precio base, antes de adiciones. */
	price: number;
	imageUrl: string | null;
	available: boolean;
	tags: ItemTag[];
	groups: ModifierGroup[];
	/** "Combina con…": ids de productos que se agregan con un toque. */
	suggestedItemIds: string[];
}

export interface Category {
	id: string;
	name: string;
	items: Item[];
}

/** Colores de la plantilla del restaurante. Se aplican como variables CSS. */
export interface MenuTheme {
	primary: string;
	primaryForeground: string;
}

export interface GeoPoint {
	lat: number;
	lng: number;
}

export type FulfillmentType = 'delivery' | 'pickup' | 'dine_in';

export interface OpenStatus {
	open: boolean;
	/** Texto listo para mostrar: "Abre hoy a las 12:00 p. m.", "Cierra a las 11:00 p. m.". */
	label: string;
}

export type KitchenLoad = 'calm' | 'busy' | 'saturated';

/** Qué tan cargada está la cocina ahora; el tiempo estimado ya viene corregido. */
export interface KitchenStatus {
	load: KitchenLoad;
	label: string;
}

export interface Menu {
	restaurant: {
		slug: string;
		name: string;
		tagline: string | null;
		logoUrl: string | null;
		/** Foto de portada de la carta. */
		coverUrl: string | null;
		theme: MenuTheme;
	};
	branch: {
		id: string;
		name: string;
		address: string;
		/** Tiempo estimado de preparación + entrega, en minutos. */
		etaMinutes: number;
		fulfillment: FulfillmentType[];
		/** Para centrar el mapa del checkout. `null`: la sede no hace domicilios. */
		location: GeoPoint | null;
	};
	status: OpenStatus;
	kitchen: KitchenStatus;
	categories: Category[];
}

export const FULFILLMENT_LABEL: Record<FulfillmentType, string> = {
	delivery: 'Domicilio',
	pickup: 'Recoger',
	dine_in: 'En el local'
};

/** Busca un producto en toda la carta. */
export function findItem(menu: Pick<Menu, 'categories'>, itemId: string): Item | null {
	for (const category of menu.categories) {
		const item = category.items.find((candidate) => candidate.id === itemId);

		if (item) return item;
	}

	return null;
}
