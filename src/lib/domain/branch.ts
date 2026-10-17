import type { CheckoutFulfillment, PaymentMethod } from '$lib/domain/checkout';
import type { GeoPoint } from '$lib/domain/menu';

/**
 * La configuración de la sede tal como la edita el dueño o el gerente.
 *
 * Es la forma que conoce la página `/dashboard/branch`. Venga de la API o de
 * fixtures, `$lib/server/api/` la traduce a esto.
 */

/** 0 = domingo … 6 = sábado. */
export interface BranchScheduleSlot {
	day: number;
	/** "HH:MM" en 24 horas. */
	opens: string;
	/** "HH:MM". Si es menor o igual que `opens`, cierra al día siguiente. */
	closes: string;
}

export interface BranchDeliveryRing {
	/** Hasta esta distancia, en kilómetros. */
	maxKm: number;
	fee: number;
	minOrder: number;
}

export interface BranchSettings {
	name: string;
	address: string;
	schedule: BranchScheduleSlot[];
	/** Preparación + entrega, en minutos. */
	etaMinutes: number;
	fulfillment: CheckoutFulfillment[];
	location: GeoPoint | null;
	deliveryRings: BranchDeliveryRing[];
	paymentMethods: PaymentMethod[];
}

export const WEEKDAY_LABEL: readonly string[] = [
	'domingo',
	'lunes',
	'martes',
	'miércoles',
	'jueves',
	'viernes',
	'sábado'
];

export const WEEKDAY_SHORT: readonly string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function dayHours(slots: readonly BranchScheduleSlot[]): string {
	if (slots.length === 0) return 'Cerrado';

	return slots
		.slice()
		.sort((a, b) => a.opens.localeCompare(b.opens))
		.map((slot) => (slot.opens === slot.closes ? '24 horas' : `${slot.opens}–${slot.closes}`))
		.join(' · ');
}

function rangeLabel(days: readonly number[]): string {
	const first = days[0];
	const last = days[days.length - 1];

	if (first === undefined || last === undefined) return '';

	return days.length === 1
		? (WEEKDAY_SHORT[first] ?? '')
		: `${WEEKDAY_SHORT[first] ?? ''} a ${WEEKDAY_SHORT[last] ?? ''}`;
}

/**
 * El horario en una línea: "Lun a Vie 11:00–22:00 · Sáb 12:00–23:00 · Dom
 * Cerrado". Agrupa días consecutivos con el mismo horario.
 */
export function scheduleSummary(schedule: readonly BranchScheduleSlot[]): string {
	const byDay = new Map<number, BranchScheduleSlot[]>();

	for (let day = 0; day < 7; day += 1) byDay.set(day, []);

	for (const slot of schedule) {
		byDay.get(slot.day)?.push(slot);
	}

	const runs: { days: number[]; hours: string }[] = [];

	for (let day = 0; day < 7; day += 1) {
		const hours = dayHours(byDay.get(day) ?? []);
		const last = runs[runs.length - 1];

		if (last && last.hours === hours) last.days.push(day);
		else runs.push({ days: [day], hours });
	}

	if (runs.length === 1) {
		const only = runs[0];

		if (!only) return 'Cerrado';

		return only.hours === 'Cerrado' ? 'Cerrado' : `Todos los días ${only.hours}`;
	}

	return runs.map((run) => `${rangeLabel(run.days)} ${run.hours}`).join(' · ');
}
