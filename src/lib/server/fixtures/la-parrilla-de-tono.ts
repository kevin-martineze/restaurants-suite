import type { Category, Menu, ModifierGroup } from '$lib/domain/menu';
import type { ScheduleSlot } from '$lib/server/fixtures/schedule';

/**
 * Restaurante de prueba: asadero de comida rápida en Barranquilla.
 *
 * FICTICIO. Nombre, dirección y precios son inventados, con la carta típica
 * de la costa, para diseñar la carta mientras llega la de un restaurante
 * piloto real (ver docs/preguntas-abiertas.md). Cuando llegue, se reemplaza
 * este archivo.
 */

export const SLUG = 'la-parrilla-de-tono';

/** Todos los días de 12:00 m. a 11:00 p. m. */
export const SCHEDULE: ScheduleSlot[] = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
	day,
	opens: '12:00',
	closes: '23:00'
}));

// --- Grupos de opciones reutilizados entre productos ------------------------

const termino: ModifierGroup = {
	id: 'termino',
	name: 'Término de la carne',
	min: 1,
	max: 1,
	modifiers: [
		{ id: 'termino-medio', name: 'Medio', priceDelta: 0, available: true },
		{ id: 'termino-tres-cuartos', name: 'Tres cuartos', priceDelta: 0, available: true },
		{ id: 'termino-bien-asada', name: 'Bien asada', priceDelta: 0, available: true }
	]
};

const salsas: ModifierGroup = {
	id: 'salsas',
	name: 'Salsas',
	min: 0,
	max: 2,
	modifiers: [
		{ id: 'salsa-rosada', name: 'Rosada', priceDelta: 0, available: true },
		{ id: 'salsa-pina', name: 'Piña', priceDelta: 0, available: true },
		{ id: 'salsa-ajo', name: 'Ajo', priceDelta: 0, available: true },
		{ id: 'salsa-bbq', name: 'BBQ', priceDelta: 0, available: true },
		{ id: 'salsa-tartara', name: 'Tártara', priceDelta: 0, available: false }
	]
};

const adicionesHamburguesa: ModifierGroup = {
	id: 'adiciones-hamburguesa',
	name: 'Adiciones',
	min: 0,
	max: 3,
	modifiers: [
		{ id: 'adicion-tocineta', name: 'Tocineta', priceDelta: 3000, available: true },
		{ id: 'adicion-queso', name: 'Queso extra', priceDelta: 2500, available: true },
		{ id: 'adicion-huevo', name: 'Huevo frito', priceDelta: 2000, available: true },
		{ id: 'adicion-maduro', name: 'Maduro', priceDelta: 2500, available: true },
		{ id: 'adicion-butifarra', name: 'Butifarra', priceDelta: 4000, available: true }
	]
};

const adicionesPerro: ModifierGroup = {
	id: 'adiciones-perro',
	name: 'Adiciones',
	min: 0,
	max: 3,
	modifiers: [
		{ id: 'perro-tocineta', name: 'Tocineta', priceDelta: 3000, available: true },
		{ id: 'perro-queso', name: 'Queso gratinado', priceDelta: 2500, available: true },
		{ id: 'perro-papita', name: 'Papita ripio', priceDelta: 0, available: true },
		{ id: 'perro-codorniz', name: 'Huevos de codorniz', priceDelta: 3000, available: true }
	]
};

const acompananteAsado: ModifierGroup = {
	id: 'acompanante-asado',
	name: 'Acompañantes',
	min: 2,
	max: 2,
	modifiers: [
		{ id: 'acomp-patacon', name: 'Patacón', priceDelta: 0, available: true },
		{ id: 'acomp-yuca', name: 'Yuca frita', priceDelta: 0, available: true },
		{ id: 'acomp-papa', name: 'Papa a la francesa', priceDelta: 0, available: true },
		{ id: 'acomp-arroz-coco', name: 'Arroz con coco', priceDelta: 2000, available: true },
		{ id: 'acomp-ensalada', name: 'Ensalada de la casa', priceDelta: 0, available: true }
	]
};

const tamanoPicada: ModifierGroup = {
	id: 'tamano-picada',
	name: 'Tamaño',
	min: 1,
	max: 1,
	modifiers: [
		{ id: 'picada-personal', name: 'Personal', priceDelta: 0, available: true },
		{ id: 'picada-para-dos', name: 'Para 2', priceDelta: 22000, available: true },
		{ id: 'picada-familiar', name: 'Familiar (4 personas)', priceDelta: 52000, available: true }
	]
};

const baseJugo: ModifierGroup = {
	id: 'base-jugo',
	name: 'Preparación',
	min: 1,
	max: 1,
	modifiers: [
		{ id: 'jugo-agua', name: 'En agua', priceDelta: 0, available: true },
		{ id: 'jugo-leche', name: 'En leche', priceDelta: 1000, available: true }
	]
};

const bebidaCombo: ModifierGroup = {
	id: 'bebida-combo',
	name: 'Bebida del combo',
	min: 1,
	max: 1,
	modifiers: [
		{ id: 'combo-kola', name: 'Kola Román 400 ml', priceDelta: 0, available: true },
		{ id: 'combo-gaseosa', name: 'Gaseosa 400 ml', priceDelta: 0, available: true },
		{ id: 'combo-corozo', name: 'Jugo de corozo', priceDelta: 2000, available: true }
	]
};

// --- Carta -----------------------------------------------------------------

const CATEGORIES: Category[] = [
	{
		id: 'hamburguesas',
		name: 'Hamburguesas',
		items: [
			{
				id: 'hamburguesa-sencilla',
				name: 'Sencilla',
				description: 'Carne de res de 150 g, queso, lechuga, tomate y papita ripio.',
				price: 18000,
				imageUrl: null,
				available: true,
				groups: [termino, adicionesHamburguesa, salsas]
			},
			{
				id: 'hamburguesa-costena',
				name: 'Costeña',
				description: 'Carne de 150 g, butifarra, queso costeño asado, suero y maduro.',
				price: 24000,
				imageUrl: null,
				available: true,
				groups: [termino, adicionesHamburguesa, salsas]
			},
			{
				id: 'hamburguesa-doble',
				name: 'Doble',
				description: 'Dos carnes de 150 g, doble queso y tocineta.',
				price: 26000,
				imageUrl: null,
				available: false,
				groups: [termino, adicionesHamburguesa, salsas]
			}
		]
	},
	{
		id: 'perros',
		name: 'Perros calientes',
		items: [
			{
				id: 'perro-sencillo',
				name: 'Perro sencillo',
				description: 'Salchicha americana, cebolla, papita ripio y salsas.',
				price: 12000,
				imageUrl: null,
				available: true,
				groups: [adicionesPerro, salsas]
			},
			{
				id: 'perro-suizo',
				name: 'Perro suizo',
				description: 'Salchicha suiza, queso gratinado, tocineta y cebolla caramelizada.',
				price: 16000,
				imageUrl: null,
				available: true,
				groups: [adicionesPerro, salsas]
			}
		]
	},
	{
		id: 'asados',
		name: 'Asados',
		items: [
			{
				id: 'punta-de-anca',
				name: 'Punta de anca 300 g',
				description: 'Al carbón, con suero costeño y dos acompañantes.',
				price: 38000,
				imageUrl: null,
				available: true,
				groups: [termino, acompananteAsado]
			},
			{
				id: 'pechuga-asada',
				name: 'Pechuga asada',
				description: 'Pechuga marinada de 300 g con dos acompañantes.',
				price: 30000,
				imageUrl: null,
				available: true,
				groups: [acompananteAsado]
			},
			{
				id: 'costillas-bbq',
				name: 'Costillas BBQ',
				description: 'Costillas de cerdo en salsa BBQ de la casa con dos acompañantes.',
				price: 36000,
				imageUrl: null,
				available: true,
				groups: [acompananteAsado]
			}
		]
	},
	{
		id: 'picadas',
		name: 'Picadas',
		items: [
			{
				id: 'picada-de-la-casa',
				name: 'Picada de la casa',
				description: 'Res, cerdo, chorizo, butifarra, patacón, yuca y suero.',
				price: 28000,
				imageUrl: null,
				available: true,
				groups: [tamanoPicada, salsas]
			}
		]
	},
	{
		id: 'combos',
		name: 'Combos',
		items: [
			{
				id: 'combo-sencilla',
				name: 'Combo hamburguesa sencilla',
				description: 'Hamburguesa sencilla, papa a la francesa y bebida.',
				price: 25000,
				imageUrl: null,
				available: true,
				groups: [termino, bebidaCombo, salsas]
			}
		]
	},
	{
		id: 'acompanantes',
		name: 'Acompañantes',
		items: [
			{
				id: 'patacon',
				name: 'Patacón',
				description: null,
				price: 6000,
				imageUrl: null,
				available: true,
				groups: []
			},
			{
				id: 'yuca-frita',
				name: 'Yuca frita',
				description: null,
				price: 6000,
				imageUrl: null,
				available: true,
				groups: []
			},
			{
				id: 'arepa-de-huevo',
				name: 'Arepa de huevo',
				description: 'Con carne molida.',
				price: 5000,
				imageUrl: null,
				available: true,
				groups: []
			},
			{
				id: 'butifarra',
				name: 'Butifarra (3 unidades)',
				description: 'Con limón y bollo.',
				price: 9000,
				imageUrl: null,
				available: true,
				groups: []
			}
		]
	},
	{
		id: 'bebidas',
		name: 'Bebidas',
		items: [
			{
				id: 'jugo-corozo',
				name: 'Jugo de corozo',
				description: 'Natural, 16 oz.',
				price: 6000,
				imageUrl: null,
				available: true,
				groups: [baseJugo]
			},
			{
				id: 'kola-roman',
				name: 'Kola Román 400 ml',
				description: null,
				price: 4500,
				imageUrl: null,
				available: true,
				groups: []
			},
			{
				id: 'cerveza',
				name: 'Cerveza nacional',
				description: 'Lata de 330 ml.',
				price: 5000,
				imageUrl: null,
				available: true,
				groups: []
			},
			{
				id: 'agua',
				name: 'Agua',
				description: '600 ml.',
				price: 3000,
				imageUrl: null,
				available: true,
				groups: []
			}
		]
	}
];

export const MENU: Omit<Menu, 'status'> = {
	restaurant: {
		slug: SLUG,
		name: 'La Parrilla de Toño',
		tagline: 'Asados al carbón y comida rápida',
		logoUrl: null,
		// Rojo brasa sobre blanco. Contraste de texto AA sobre `primary`.
		theme: { primary: 'oklch(0.52 0.19 33)', primaryForeground: 'oklch(0.99 0 0)' }
	},
	branch: {
		id: 'prado',
		name: 'Sede El Prado',
		address: 'El Prado, Barranquilla',
		etaMinutes: 35,
		fulfillment: ['delivery', 'pickup']
	},
	categories: CATEGORIES
};
