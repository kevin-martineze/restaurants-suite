<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { CheckoutFulfillment, PaymentMethod } from '$lib/domain/checkout';
	import type { GeoPoint } from '$lib/domain/menu';
	import type { BranchDeliveryRing, BranchScheduleSlot } from '$lib/domain/branch';
	import type { ActionData, PageData } from './$types';

	import { untrack } from 'svelte';

	import Copy from '@lucide/svelte/icons/copy';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	import { enhance } from '$app/forms';

	import { Button } from '$lib/components/atoms/button';
	import { Input } from '$lib/components/atoms/input';
	import LocationPicker from '$lib/components/molecules/LocationPicker.svelte';
	import { WEEKDAY_LABEL } from '$lib/domain/branch';
	import { FULFILLMENT_OPTION_LABEL, PAYMENT_METHOD_LABEL } from '$lib/domain/checkout';
	import { cn } from '$lib/utils';
	import { formatAmount, formatMoney } from '$lib/utils/money';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	const error = $derived(form?.branchError ?? null);

	// La sede sin ubicación se centra en El Prado, Barranquilla, para que el
	// dueño encuentre su punto desde ahí.
	const DEFAULT_CENTER: GeoPoint = { lat: 10.9965, lng: -74.8066 };

	let fulfillment = $state<CheckoutFulfillment[]>(untrack(() => [...data.settings.fulfillment]));
	let paymentMethods = $state<PaymentMethod[]>(untrack(() => [...data.settings.paymentMethods]));
	let location = $state<GeoPoint | null>(
		untrack(() => (data.settings.location ? { ...data.settings.location } : null))
	);
	let rings = $state<BranchDeliveryRing[]>(
		untrack(() => data.settings.deliveryRings.map((ring) => ({ ...ring })))
	);
	let scheduleByDay = $state<BranchScheduleSlot[][]>(
		untrack(() => {
			const byDay: BranchScheduleSlot[][] = Array.from({ length: 7 }, () => []);

			for (const slot of data.settings.schedule) byDay[slot.day]?.push({ ...slot });

			return byDay;
		})
	);

	let submitting = $state(false);
	let saved = $state(false);

	const fulfillmentOptions: CheckoutFulfillment[] = ['delivery', 'pickup'];
	const paymentOptions: PaymentMethod[] = ['cash', 'card_on_delivery'];

	const offersDelivery = $derived(fulfillment.includes('delivery'));
	const scheduleJson = $derived(JSON.stringify(scheduleByDay.flat()));
	const locationJson = $derived(location ? JSON.stringify(location) : '');
	const ringsJson = $derived(JSON.stringify(rings));

	function toggleFulfillment(value: CheckoutFulfillment) {
		fulfillment = fulfillment.includes(value)
			? fulfillment.filter((item) => item !== value)
			: [...fulfillment, value];
	}

	function togglePayment(value: PaymentMethod) {
		paymentMethods = paymentMethods.includes(value)
			? paymentMethods.filter((item) => item !== value)
			: [...paymentMethods, value];
	}

	function isOpen(day: number): boolean {
		return (scheduleByDay[day]?.length ?? 0) > 0;
	}

	function toggleDay(day: number) {
		scheduleByDay[day] = isOpen(day) ? [] : [{ day, opens: '11:00', closes: '22:00' }];
	}

	function addSlot(day: number) {
		scheduleByDay[day] = [...(scheduleByDay[day] ?? []), { day, opens: '11:00', closes: '22:00' }];
	}

	function removeSlot(day: number, index: number) {
		scheduleByDay[day] = (scheduleByDay[day] ?? []).filter((_, position) => position !== index);
	}

	function copyDayToAll(day: number) {
		const source = (scheduleByDay[day] ?? []).map((slot) => ({ ...slot }));

		for (let target = 0; target < 7; target += 1) {
			scheduleByDay[target] = source.map((slot) => ({ ...slot, day: target }));
		}
	}

	function onSlotTime(day: number, index: number, field: 'opens' | 'closes', event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const slot = scheduleByDay[day]?.[index];

		if (slot) slot[field] = input.value;
	}

	function addRing() {
		if (rings.length >= 5) return;

		const last = rings[rings.length - 1];

		rings.push({
			maxKm: last ? last.maxKm + 1 : 3,
			fee: last ? last.fee : 3000,
			minOrder: last ? last.minOrder : 20000
		});
	}

	function removeRing(index: number) {
		rings.splice(index, 1);
	}

	function onRingKm(event: Event, ring: BranchDeliveryRing) {
		const value = Number((event.currentTarget as HTMLInputElement).value);

		ring.maxKm = Number.isFinite(value) ? value : 0;
	}

	function onRingMoney(event: Event, ring: BranchDeliveryRing, field: 'fee' | 'minOrder') {
		const input = event.currentTarget as HTMLInputElement;
		const digits = input.value.replace(/\D/g, '');
		const amount = digits === '' ? 0 : Number(digits);

		ring[field] = amount;
		input.value = amount === 0 ? '' : formatAmount(amount);
	}

	const track: SubmitFunction = () => {
		submitting = true;
		saved = false;

		return async ({ result, update }) => {
			await update({ reset: false });
			submitting = false;
			if (result.type === 'success') saved = true;
		};
	};
</script>

<svelte:head>
	<title>Sede · {data.tenantName}</title>
</svelte:head>

<main class="mx-auto flex max-w-3xl flex-col gap-5 p-4 lg:p-6">
	<div>
		<h1 class="title text-3xl">Sede</h1>
		<p class="text-sm text-muted-foreground">
			El nombre, el horario y la cobertura que el cliente ve en la carta.
		</p>
	</div>

	<form method="POST" action="?/save" class="flex flex-col gap-5" use:enhance={track}>
		<section
			class="flex flex-col gap-3 rounded-3xl bg-background p-4 shadow-sm"
			aria-labelledby="datos"
		>
			<h2 id="datos" class="title text-xl">Datos</h2>
			<label class="flex flex-col gap-1.5">
				<span class="text-sm font-semibold">Nombre de la sede</span>
				<Input name="name" value={data.settings.name} required maxlength={120} class="h-11" />
			</label>
			<label class="flex flex-col gap-1.5">
				<span class="text-sm font-semibold">Dirección</span>
				<Input
					name="address"
					value={data.settings.address}
					required
					maxlength={200}
					placeholder="El Prado, Barranquilla"
					class="h-11"
				/>
			</label>
		</section>

		<section
			class="flex flex-col gap-3 rounded-3xl bg-background p-4 shadow-sm"
			aria-labelledby="horario"
		>
			<h2 id="horario" class="title text-xl">Horario</h2>
			<p class="text-sm text-muted-foreground">
				Un turno que termina antes de empezar cierra al día siguiente.
			</p>

			<div class="flex flex-col divide-y divide-border">
				{#each WEEKDAY_LABEL as label, day (day)}
					<div class="flex flex-col gap-2 py-3">
						<div class="flex items-center gap-3">
							<span class="w-20 capitalize font-semibold">{label}</span>
							<button
								type="button"
								class={cn(
									'h-9 rounded-full px-4 text-sm font-semibold',
									isOpen(day) ? 'bg-success/10 text-success' : 'bg-secondary text-muted-foreground'
								)}
								onclick={() => toggleDay(day)}
							>
								{isOpen(day) ? 'Abierto' : 'Cerrado'}
							</button>
							{#if isOpen(day)}
								<button
									type="button"
									title="Copiar a todos los días"
									aria-label={`Copiar el horario de ${label} a todos los días`}
									class="ml-auto flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
									onclick={() => copyDayToAll(day)}
								>
									<Copy class="size-4" />
								</button>
							{/if}
						</div>

						{#if isOpen(day)}
							<div class="flex flex-col gap-2 pl-1">
								{#each scheduleByDay[day] ?? [] as slot, index (index)}
									<div class="flex items-center gap-2">
										<input
											type="time"
											value={slot.opens}
											aria-label={`${label}: abre`}
											class="h-10 rounded-lg border border-input bg-background px-3 tabular"
											oninput={(event) => onSlotTime(day, index, 'opens', event)}
										/>
										<span class="text-muted-foreground">a</span>
										<input
											type="time"
											value={slot.closes}
											aria-label={`${label}: cierra`}
											class="h-10 rounded-lg border border-input bg-background px-3 tabular"
											oninput={(event) => onSlotTime(day, index, 'closes', event)}
										/>
										<button
											type="button"
											aria-label={`Quitar turno de ${label}`}
											class="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
											onclick={() => removeSlot(day, index)}
										>
											<Trash2 class="size-4" />
										</button>
									</div>
								{/each}
								<Button
									type="button"
									variant="ghost"
									class="h-9 self-start"
									onclick={() => addSlot(day)}
								>
									<Plus class="size-4" /> Agregar turno
								</Button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>

		<section
			class="flex flex-col gap-3 rounded-3xl bg-background p-4 shadow-sm"
			aria-labelledby="entrega"
		>
			<h2 id="entrega" class="title text-xl">Entrega</h2>
			<fieldset class="flex flex-col gap-2">
				<legend class="mb-1 text-sm font-semibold">¿Cómo recibe el cliente?</legend>
				{#each fulfillmentOptions as value (value)}
					<label
						class={cn(
							'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2',
							fulfillment.includes(value) ? 'border-primary bg-primary/5' : 'border-border'
						)}
					>
						<input
							type="checkbox"
							name="fulfillment"
							{value}
							checked={fulfillment.includes(value)}
							onchange={() => toggleFulfillment(value)}
							class="accent-primary"
						/>
						{FULFILLMENT_OPTION_LABEL[value]}
					</label>
				{/each}
			</fieldset>

			<label class="flex flex-col gap-1.5">
				<span class="text-sm font-semibold">Tiempo estimado (minutos)</span>
				<Input
					name="etaMinutes"
					type="number"
					value={data.settings.etaMinutes}
					min={5}
					max={240}
					required
					class="h-11"
				/>
				<span class="text-xs text-muted-foreground">
					Preparación y entrega. Entre 5 y 240 minutos.
				</span>
			</label>
		</section>

		<section
			class="flex flex-col gap-3 rounded-3xl bg-background p-4 shadow-sm"
			aria-labelledby="ubicacion"
		>
			<h2 id="ubicacion" class="title text-xl">Ubicación</h2>
			<p class="text-sm text-muted-foreground">
				De aquí salen los domicilios. Mueve el mapa hasta dejar el pin en la sede.
			</p>

			<LocationPicker
				initial={location ?? DEFAULT_CENTER}
				hasPoint={location !== null}
				onChange={(point) => (location = point)}
			/>

			{#if location}
				<Button
					type="button"
					variant="ghost"
					class="h-9 self-start"
					onclick={() => (location = null)}
				>
					Quitar ubicación
				</Button>
			{/if}
		</section>

		<section
			class="flex flex-col gap-3 rounded-3xl bg-background p-4 shadow-sm"
			aria-labelledby="anillos"
		>
			<h2 id="anillos" class="title text-xl">Anillos de cobertura</h2>
			<p class="text-sm text-muted-foreground">
				Hasta dónde llega el domicilio, cuánto cuesta y el pedido mínimo.
			</p>

			{#if rings.length === 0}
				<p class="text-sm text-muted-foreground">
					Sin anillos no hay domicilio. Agrega uno para empezar.
				</p>
			{/if}

			<div class="flex flex-col gap-3">
				{#each rings as ring, index (index)}
					<div class="flex flex-col gap-2 rounded-xl border border-border p-3">
						<div class="grid grid-cols-3 gap-2">
							<label class="flex flex-col gap-1">
								<span class="text-xs font-semibold text-muted-foreground">Hasta (km)</span>
								<input
									type="number"
									value={ring.maxKm === 0 ? '' : ring.maxKm}
									min={0.1}
									max={50}
									step={0.1}
									class="h-10 rounded-lg border border-input bg-background px-3 tabular"
									oninput={(event) => onRingKm(event, ring)}
								/>
							</label>
							<label class="flex flex-col gap-1">
								<span class="text-xs font-semibold text-muted-foreground">Domicilio ($)</span>
								<input
									inputmode="numeric"
									value={ring.fee === 0 ? '' : formatAmount(ring.fee)}
									class="h-10 rounded-lg border border-input bg-background px-3 tabular"
									oninput={(event) => onRingMoney(event, ring, 'fee')}
								/>
							</label>
							<label class="flex flex-col gap-1">
								<span class="text-xs font-semibold text-muted-foreground">Mínimo ($)</span>
								<input
									inputmode="numeric"
									value={ring.minOrder === 0 ? '' : formatAmount(ring.minOrder)}
									class="h-10 rounded-lg border border-input bg-background px-3 tabular"
									oninput={(event) => onRingMoney(event, ring, 'minOrder')}
								/>
							</label>
						</div>
						<div class="flex items-center justify-between gap-2">
							<span class="text-xs text-muted-foreground">
								Hasta {ring.maxKm} km · domicilio {formatMoney(ring.fee)} · mínimo {formatMoney(
									ring.minOrder
								)}
							</span>
							<button
								type="button"
								aria-label={`Quitar anillo ${index + 1}`}
								class="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
								onclick={() => removeRing(index)}
							>
								<Trash2 class="size-4" />
							</button>
						</div>
					</div>
				{/each}
			</div>

			<Button
				type="button"
				variant="outline"
				class="h-9 self-start"
				disabled={rings.length >= 5}
				onclick={addRing}
			>
				<Plus class="size-4" /> Agregar anillo
			</Button>
		</section>

		<section
			class="flex flex-col gap-3 rounded-3xl bg-background p-4 shadow-sm"
			aria-labelledby="pagos"
		>
			<h2 id="pagos" class="title text-xl">Pagos</h2>
			<fieldset class="flex flex-col gap-2">
				<legend class="mb-1 text-sm font-semibold">¿Cómo paga el cliente?</legend>
				{#each paymentOptions as value (value)}
					<label
						class={cn(
							'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2',
							paymentMethods.includes(value) ? 'border-primary bg-primary/5' : 'border-border'
						)}
					>
						<input
							type="checkbox"
							name="paymentMethods"
							{value}
							checked={paymentMethods.includes(value)}
							onchange={() => togglePayment(value)}
							class="accent-primary"
						/>
						{PAYMENT_METHOD_LABEL[value]}
					</label>
				{/each}
			</fieldset>
		</section>

		<input type="hidden" name="schedule" value={scheduleJson} />
		<input type="hidden" name="location" value={locationJson} />
		<input type="hidden" name="deliveryRings" value={ringsJson} />

		{#if error}
			<p class="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">{error}</p>
		{/if}

		{#if saved}
			<p class="rounded-xl bg-success/10 p-3 text-sm font-medium text-success">Sede guardada.</p>
		{/if}

		<Button
			type="submit"
			class="h-12 text-base"
			disabled={submitting || (offersDelivery && (!location || rings.length === 0))}
		>
			{submitting ? 'Guardando…' : 'Guardar sede'}
		</Button>
	</form>
</main>
