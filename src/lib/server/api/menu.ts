import type { CartRequestLine, Quote, QuotedLine, RejectedLine } from '$lib/domain/cart';
import type { Menu } from '$lib/domain/menu';
import type { ApiResult } from '$lib/server/api/client';
import type { PublicContext } from '$lib/server/context';

import { lineKey } from '$lib/domain/cart';
import { findItem } from '$lib/domain/menu';
import { selectionLabel, selectionProblems, unitPrice } from '$lib/domain/menu-selection';
import { MENU, SCHEDULE, SLUG } from '$lib/server/fixtures/la-parrilla-de-tono';
import { openStatus } from '$lib/server/fixtures/schedule';

/**
 * Carta pública y cotización del carrito.
 *
 * Etapa de fixtures: las dos funciones responden con el restaurante de prueba
 * y con la misma firma que tendrán al llamar a la API. Cuando exista el módulo
 * de menú en `restaurants-api`, se cambia el cuerpo de cada una por
 * `publicRequest` + esquema zod, y ninguna página se entera.
 */

function notFound<T>(): ApiResult<T> {
	return {
		ok: false,
		status: 404,
		code: 'not_found',
		message: 'Este restaurante no existe.',
		details: undefined
	};
}

// FIXTURE: GET /public/:slug/menu
export async function getMenu(ctx: PublicContext, now = new Date()): Promise<ApiResult<Menu>> {
	if (ctx.slug !== SLUG) return notFound();

	return { ok: true, data: { ...MENU, status: openStatus(SCHEDULE, now) } };
}

// FIXTURE: POST /public/:slug/quote
export async function quoteCart(
	ctx: PublicContext,
	lines: CartRequestLine[]
): Promise<ApiResult<Quote>> {
	if (ctx.slug !== SLUG) return notFound();

	const quoted: QuotedLine[] = [];
	const rejected: RejectedLine[] = [];

	for (const line of lines) {
		const key = lineKey(line.itemId, line.modifierIds, line.note);
		const item = findItem(MENU, line.itemId);

		if (!item) {
			rejected.push({ key, name: 'Producto', reason: 'Este producto ya no está en la carta.' });
			continue;
		}

		const [problem] = selectionProblems(item, line.modifierIds);

		if (problem) {
			rejected.push({ key, name: item.name, reason: problem });
			continue;
		}

		const price = unitPrice(item, line.modifierIds);

		quoted.push({
			key,
			itemId: item.id,
			modifierIds: line.modifierIds,
			name: item.name,
			modifiersLabel: selectionLabel(item, line.modifierIds),
			note: line.note,
			qty: line.qty,
			unitPrice: price,
			total: price * line.qty
		});
	}

	return {
		ok: true,
		data: {
			lines: quoted,
			rejected,
			subtotal: quoted.reduce((sum, line) => sum + line.total, 0)
		}
	};
}
