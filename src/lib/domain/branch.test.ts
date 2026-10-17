import { describe, expect, it } from 'vitest';

import { scheduleSummary } from '$lib/domain/branch';

describe('scheduleSummary', () => {
	it('agrupa días seguidos con el mismo horario y marca los cerrados', () => {
		const schedule = [1, 2, 3, 4, 5].map((day) => ({
			day,
			opens: '11:00',
			closes: '22:00'
		}));

		expect(scheduleSummary(schedule)).toBe('Dom Cerrado · Lun a Vie 11:00–22:00 · Sáb Cerrado');
	});

	it('un día suelto lleva su nombre solo', () => {
		expect(scheduleSummary([{ day: 3, opens: '12:00', closes: '23:00' }])).toBe(
			'Dom a Mar Cerrado · Mié 12:00–23:00 · Jue a Sáb Cerrado'
		);
	});

	it('todos los días iguales se resumen', () => {
		const schedule = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
			day,
			opens: '00:00',
			closes: '00:00'
		}));

		expect(scheduleSummary(schedule)).toBe('Todos los días 24 horas');
	});

	it('un día cerrado aparece como Cerrado', () => {
		const schedule = [0, 1, 2, 3, 4, 5].map((day) => ({
			day,
			opens: '11:00',
			closes: '22:00'
		}));

		expect(scheduleSummary(schedule)).toBe('Dom a Vie 11:00–22:00 · Sáb Cerrado');
	});

	it('sin turnos todo está cerrado', () => {
		expect(scheduleSummary([])).toBe('Cerrado');
	});
});
