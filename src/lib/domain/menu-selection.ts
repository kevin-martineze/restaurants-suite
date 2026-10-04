import type { Item, ModifierGroup } from '$lib/domain/menu';

/**
 * Reglas de elección de modificadores.
 *
 * Son puras para que la hoja de opciones y la cotización del servidor digan
 * exactamente lo mismo. Cuando la cotización pase a la API, la API tendrá su
 * propia copia; esta se queda para guiar al cliente mientras elige.
 *
 * Una selección es la lista de ids de modificadores elegidos, de cualquier
 * grupo del producto.
 */

/** Se pinta como radio (una sola opción) en vez de casillas. */
export function isSingleChoice(group: ModifierGroup): boolean {
	return group.max === 1;
}

export function isRequired(group: ModifierGroup): boolean {
	return group.min >= 1;
}

/** La regla del grupo en palabras: "Obligatorio · elige 1", "Opcional · hasta 3". */
export function groupRuleLabel(group: ModifierGroup): string {
	if (!isRequired(group)) {
		return group.max === 1 ? 'Opcional' : `Opcional · hasta ${group.max}`;
	}

	if (group.min === group.max) return `Obligatorio · elige ${group.min}`;

	return `Obligatorio · elige entre ${group.min} y ${group.max}`;
}

/**
 * Marca o desmarca una opción respetando el grupo.
 *
 * En un grupo de una sola opción, elegir otra reemplaza la anterior. En uno de
 * varias, con el máximo alcanzado no se agrega nada: la UI ya muestra las
 * restantes apagadas, esto es la red por debajo.
 */
export function toggleModifier(
	selection: readonly string[],
	group: ModifierGroup,
	modifierId: string
): string[] {
	const groupIds = new Set(group.modifiers.map((modifier) => modifier.id));

	if (!groupIds.has(modifierId)) return [...selection];

	if (selection.includes(modifierId)) {
		// En un grupo obligatorio de una sola opción no se puede quedar en blanco
		// tocando la misma: así se comporta un radio.
		if (isSingleChoice(group) && isRequired(group)) return [...selection];

		return selection.filter((id) => id !== modifierId);
	}

	if (isSingleChoice(group)) {
		return [...selection.filter((id) => !groupIds.has(id)), modifierId];
	}

	const chosenInGroup = selection.filter((id) => groupIds.has(id)).length;

	if (chosenInGroup >= group.max) return [...selection];

	return [...selection, modifierId];
}

/** Cuántas opciones del grupo están elegidas. */
export function countInGroup(selection: readonly string[], group: ModifierGroup): number {
	return group.modifiers.filter((modifier) => selection.includes(modifier.id)).length;
}

/**
 * Lo que impide pedir el producto con esta selección, en el orden en que el
 * cliente lo resolvería. Vacío si todo está bien.
 */
export function selectionProblems(item: Item, selection: readonly string[]): string[] {
	const problems: string[] = [];

	if (!item.available) problems.push(`«${item.name}» se agotó.`);

	if (new Set(selection).size !== selection.length) {
		problems.push(`Una opción de «${item.name}» viene repetida.`);
	}

	const known = new Map(
		item.groups.flatMap((group) => group.modifiers.map((modifier) => [modifier.id, modifier]))
	);

	for (const id of selection) {
		const modifier = known.get(id);

		if (!modifier) {
			problems.push(`Una de las opciones de «${item.name}» ya no existe.`);
		} else if (!modifier.available) {
			problems.push(`«${modifier.name}» se agotó.`);
		}
	}

	for (const group of item.groups) {
		const count = countInGroup(selection, group);

		if (count < group.min) {
			problems.push(
				group.min === 1
					? `Elige una opción en «${group.name}».`
					: `Elige al menos ${group.min} en «${group.name}».`
			);
		} else if (count > group.max) {
			problems.push(`Elige máximo ${group.max} en «${group.name}».`);
		}
	}

	return problems;
}

/** Precio de una unidad: base más lo que suman las opciones elegidas. */
export function unitPrice(item: Item, selection: readonly string[]): number {
	let total = item.price;

	for (const group of item.groups) {
		for (const modifier of group.modifiers) {
			if (selection.includes(modifier.id)) total += modifier.priceDelta;
		}
	}

	return total;
}

/** Las opciones elegidas en texto corto, en el orden de los grupos: "Tres cuartos · Tocineta". */
export function selectionLabel(item: Item, selection: readonly string[]): string {
	return item.groups
		.flatMap((group) => group.modifiers)
		.filter((modifier) => selection.includes(modifier.id))
		.map((modifier) => modifier.name)
		.join(' · ');
}
