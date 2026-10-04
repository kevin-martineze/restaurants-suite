<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import type { CheckoutFulfillment, PaymentMethod } from '$lib/domain/checkout';
	import type { GeoPoint } from '$lib/domain/menu';

	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Banknote from '@lucide/svelte/icons/banknote';
	import Bike from '@lucide/svelte/icons/bike';
	import CreditCard from '@lucide/svelte/icons/credit-card';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import Store from '@lucide/svelte/icons/store';

	import { enhance } from '$app/forms';

	import { Button } from '$lib/components/atoms/button';
	import { Input } from '$lib/components/atoms/input';
	import { Textarea } from '$lib/components/atoms/textarea';
	import ChoiceCard from '$lib/components/molecules/ChoiceCard.svelte';
	import LocationPicker from '$lib/components/molecules/LocationPicker.svelte';
	import OrderSummary from '$lib/components/organisms/OrderSummary.svelte';
	import {
		cashSuggestions,
		changeFor,
		FULFILLMENT_OPTION_LABEL,
		PAYMENT_METHOD_HINT,
		PAYMENT_METHOD_LABEL
	} from '$lib/domain/checkout';
	import { themeStyle } from '$lib/domain/theme';
	import { cart } from '$lib/stores/cart.svelte';
	import { readCheckoutMemory, writeCheckoutMemory } from '$lib/stores/checkout-memory';
	import { cn } from '$lib/utils';
	import { formatMoney } from '$lib/utils/money';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	const menu = $derived(data.menu);
	const slug = $derived(menu.restaurant.slug);
	const style = $derived(themeStyle(menu.restaurant.theme));
	const offersDelivery = $derived(
		menu.branch.fulfillment.includes('delivery') && menu.branch.location !== null
	);
	const offersPickup = $derived(menu.branch.fulfillment.includes('pickup'));

	// Barranquilla, por si la sede no tiene ubicación (no debería pasar si hace domicilios).
	const FALLBACK_CENTER: GeoPoint = { lat: 10.9878, lng: -74.7889 };

	let hydrated = $state(false);
	let fulfillment = $state<CheckoutFulfillment>('delivery');
	let name = $state('');
	let phone = $state('');
	let address = $state('');
	let neighborhood = $state('');
	let references = $state('');
	let notes = $state('');
	let location = $state<GeoPoint | null>(null);
	let mapStart = $state<GeoPoint | null>(null);
	let paymentMethod = $state<PaymentMethod>('cash');
	let cashTendered = $state<number | null>(null);
	let customCash = $state('');
	let consentService = $state(false);
	let consentMarketing = $state(false);
	let idempotencyKey = $state('');
	let submitting = $state(false);
	let previewForm = $state<HTMLFormElement | null>(null);

	// Carrito, datos del último pedido y clave del pedido: todo vive en el
	// navegador, así que se carga al montar.
	$effect(() => {
		cart.hydrate(slug);

		const saved = readCheckoutMemory(slug);

		if (saved) {
			name = saved.name;
			phone = saved.phone;
			address = saved.address;
			neighborhood = saved.neighborhood;
			references = saved.references;
			location = saved.location;
		}

		mapStart = saved?.location ?? menu.branch.location ?? FALLBACK_CENTER;
		fulfillment = offersDelivery ? 'delivery' : 'pickup';
		idempotencyKey = crypto.randomUUID();
		hydrated = true;
	});

	const delivery = $derived(fulfillment === 'delivery');
	const cartPayload = $derived(cart.serialize());
	// Igual a la que arma el servidor: dice si la cotización es de lo que hay en pantalla.
	const previewKey = $derived(
		JSON.stringify([
			cartPayload,
			fulfillment,
			delivery && location ? String(location.lat) : '',
			delivery && location ? String(location.lng) : ''
		])
	);
	const preview = $derived(form?.previewKey === previewKey ? (form?.preview ?? null) : null);
	const total = $derived(preview?.total ?? cart.previewSubtotal);
	const cashOptions = $derived(cashSuggestions(total));
	// Mientras llega la cotización se muestran los dos; la API dice cuáles recibe la sede.
	const ALL_PAYMENT_METHODS: PaymentMethod[] = ['cash', 'card_on_delivery'];
	const paymentMethods = $derived(preview?.paymentMethods ?? ALL_PAYMENT_METHODS);
	const fieldErrors = $derived(form?.fieldErrors ?? {});
	const canSubmit = $derived(
		hydrated && !submitting && preview !== null && preview.blockers.length === 0
	);

	// Cada cambio de carrito, entrega o punto del mapa vuelve a cotizar, con
	// una pausa corta para no cotizar en cada movimiento del mapa.
	$effect(() => {
		if (!hydrated || !previewForm || cart.isEmpty || !previewKey) return;

		const target = previewForm;
		const timer = setTimeout(() => target.requestSubmit(), 350);

		return () => clearTimeout(timer);
	});

	function errorOf(field: string): string | null {
		const messages: unknown = Reflect.get(fieldErrors, field);

		return Array.isArray(messages) && typeof messages[0] === 'string' ? messages[0] : null;
	}

	function chooseCash(value: number | null) {
		cashTendered = value;
		customCash = '';
	}
</script>

<svelte:head>
	<title>Tu pedido · {menu.restaurant.name}</title>
</svelte:head>

<div {style} class="min-h-dvh bg-secondary/40 pb-32 lg:pb-16">
	<header class="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-xl">
		<div class="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 lg:px-8">
			<a
				href={`/${slug}`}
				class="flex size-10 items-center justify-center rounded-full hover:bg-secondary"
				aria-label="Volver a la carta"
			>
				<ArrowLeft class="size-5" />
			</a>
			<div class="flex min-w-0 flex-col">
				<span class="title text-lg leading-tight">Finaliza tu pedido</span>
				<span class="truncate text-sm text-muted-foreground">{menu.restaurant.name}</span>
			</div>
		</div>
	</header>

	{#if hydrated && cart.isEmpty}
		<main class="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-24 text-center">
			<ShoppingBag class="size-12 text-muted-foreground" />
			<h1 class="title text-2xl">Tu pedido está vacío</h1>
			<p class="text-muted-foreground">Vuelve a la carta y agrega lo que se te antoje.</p>
			<Button href={`/${slug}`} class="mt-2 h-12 px-6 text-base">Ver la carta</Button>
		</main>
	{:else}
		<!-- Cotización en segundo plano: se envía sola cuando cambia algo. -->
		<form
			bind:this={previewForm}
			method="POST"
			action="?/preview"
			class="hidden"
			use:enhance={() =>
				async ({ update }) =>
					update({ reset: false, invalidateAll: false })}
		>
			<input type="hidden" name="cart" value={cartPayload} />
			<input type="hidden" name="fulfillment" value={fulfillment} />
			<input type="hidden" name="lat" value={delivery && location ? String(location.lat) : ''} />
			<input type="hidden" name="lng" value={delivery && location ? String(location.lng) : ''} />
		</form>

		<form
			method="POST"
			action="?/order"
			class="mx-auto grid max-w-6xl gap-6 px-4 pt-6 lg:grid-cols-5 lg:gap-10 lg:px-8"
			use:enhance={() => {
				submitting = true;
				writeCheckoutMemory(slug, { name, phone, address, neighborhood, references, location });

				return async ({ update }) => {
					await update({ reset: false, invalidateAll: false });
					submitting = false;
				};
			}}
		>
			<input type="hidden" name="cart" value={cartPayload} />
			<input type="hidden" name="idempotencyKey" value={idempotencyKey} />
			<input type="hidden" name="lat" value={delivery && location ? String(location.lat) : ''} />
			<input type="hidden" name="lng" value={delivery && location ? String(location.lng) : ''} />
			<input
				type="hidden"
				name="cashTendered"
				value={paymentMethod === 'cash' && cashTendered !== null ? String(cashTendered) : ''}
			/>

			<div class="flex flex-col gap-6 lg:col-span-3">
				<section class="flex flex-col gap-3 rounded-3xl bg-background p-5 shadow-sm">
					<h2 class="title text-xl">¿Cómo lo quieres?</h2>
					<div class="grid gap-3 sm:grid-cols-2">
						<ChoiceCard
							name="fulfillment"
							value="delivery"
							checked={delivery}
							title={FULFILLMENT_OPTION_LABEL.delivery}
							hint={offersDelivery
								? `Llega en unos ${menu.branch.etaMinutes} min`
								: 'No disponible'}
							icon={Bike}
							disabled={!offersDelivery}
							onSelect={() => (fulfillment = 'delivery')}
						/>
						<ChoiceCard
							name="fulfillment"
							value="pickup"
							checked={!delivery}
							title={FULFILLMENT_OPTION_LABEL.pickup}
							hint={offersPickup ? menu.branch.address : 'No disponible'}
							icon={Store}
							disabled={!offersPickup}
							onSelect={() => (fulfillment = 'pickup')}
						/>
					</div>
				</section>

				{#if delivery}
					<section class="flex flex-col gap-4 rounded-3xl bg-background p-5 shadow-sm">
						<div>
							<h2 class="title text-xl">¿Dónde te lo llevamos?</h2>
							<p class="text-sm text-muted-foreground">
								El punto del mapa es lo que usa el domiciliario para llegar.
							</p>
						</div>

						{#if mapStart}
							<LocationPicker
								initial={mapStart}
								hasPoint={location !== null}
								onChange={(point) => (location = point)}
							/>
						{/if}
						{#if errorOf('lat')}
							<p class="text-sm font-medium text-destructive">{errorOf('lat')}</p>
						{/if}

						<label class="flex flex-col gap-1.5">
							<span class="text-sm font-semibold">Dirección</span>
							<Input
								name="address"
								bind:value={address}
								autocomplete="street-address"
								placeholder="Calle 76 #54-30, apto 302"
								class="h-12 text-base"
								aria-invalid={errorOf('address') ? 'true' : undefined}
							/>
							{#if errorOf('address')}
								<span class="text-sm text-destructive">{errorOf('address')}</span>
							{/if}
						</label>
						<div class="grid gap-4 sm:grid-cols-2">
							<label class="flex flex-col gap-1.5">
								<span class="text-sm font-semibold">Barrio</span>
								<Input
									name="neighborhood"
									bind:value={neighborhood}
									placeholder="Alto Prado"
									class="h-12 text-base"
								/>
							</label>
							<label class="flex flex-col gap-1.5">
								<span class="text-sm font-semibold">
									Referencias <span class="font-normal text-muted-foreground">(opcional)</span>
								</span>
								<Input
									name="references"
									bind:value={references}
									placeholder="Edificio blanco, portón negro"
									class="h-12 text-base"
								/>
							</label>
						</div>
					</section>
				{:else}
					<input type="hidden" name="address" value="" />
				{/if}

				<section class="flex flex-col gap-4 rounded-3xl bg-background p-5 shadow-sm">
					<h2 class="title text-xl">Tus datos</h2>
					<div class="grid gap-4 sm:grid-cols-2">
						<label class="flex flex-col gap-1.5">
							<span class="text-sm font-semibold">Nombre</span>
							<Input
								name="name"
								bind:value={name}
								autocomplete="name"
								placeholder="¿A nombre de quién?"
								class="h-12 text-base"
								aria-invalid={errorOf('name') ? 'true' : undefined}
							/>
							{#if errorOf('name')}
								<span class="text-sm text-destructive">{errorOf('name')}</span>
							{/if}
						</label>
						<label class="flex flex-col gap-1.5">
							<span class="text-sm font-semibold">Celular</span>
							<Input
								name="phone"
								bind:value={phone}
								type="tel"
								inputmode="tel"
								autocomplete="tel"
								placeholder="300 123 4567"
								class="h-12 text-base"
								aria-invalid={errorOf('phone') ? 'true' : undefined}
							/>
							{#if errorOf('phone')}
								<span class="text-sm text-destructive">{errorOf('phone')}</span>
							{:else}
								<span class="text-xs text-muted-foreground">Por aquí te avisamos del pedido.</span>
							{/if}
						</label>
					</div>
					<label class="flex flex-col gap-1.5">
						<span class="text-sm font-semibold">
							Notas para el restaurante <span class="font-normal text-muted-foreground"
								>(opcional)</span
							>
						</span>
						<Textarea
							name="notes"
							bind:value={notes}
							rows={2}
							maxlength={280}
							placeholder="Ej.: el timbre no sirve, llamar al llegar"
						/>
					</label>
				</section>

				<section class="flex flex-col gap-4 rounded-3xl bg-background p-5 shadow-sm">
					<div>
						<h2 class="title text-xl">¿Cómo pagas?</h2>
						<p class="text-sm text-muted-foreground">
							Pagas al {delivery ? 'recibir tu pedido' : 'recogerlo'}.
						</p>
					</div>
					<div class="grid gap-3 sm:grid-cols-2">
						{#each paymentMethods as method (method)}
							<ChoiceCard
								name="paymentMethod"
								value={method}
								checked={paymentMethod === method}
								title={PAYMENT_METHOD_LABEL[method]}
								hint={PAYMENT_METHOD_HINT[method]}
								icon={method === 'cash' ? Banknote : CreditCard}
								onSelect={() => (paymentMethod = method)}
							/>
						{/each}
					</div>

					{#if paymentMethod === 'cash'}
						<div class="flex flex-col gap-2">
							<span class="text-sm font-semibold">¿Con cuánto pagas?</span>
							<div class="flex flex-wrap gap-2">
								<button
									type="button"
									class={cn(
										'h-10 rounded-full border px-4 text-sm font-semibold transition-colors',
										cashTendered === null && customCash === ''
											? 'border-foreground bg-foreground text-background'
											: 'border-border hover:bg-secondary'
									)}
									onclick={() => chooseCash(null)}
								>
									Pago exacto
								</button>
								{#each cashOptions as option (option)}
									<button
										type="button"
										class={cn(
											'tabular h-10 rounded-full border px-4 text-sm font-semibold transition-colors',
											cashTendered === option && customCash === ''
												? 'border-foreground bg-foreground text-background'
												: 'border-border hover:bg-secondary'
										)}
										onclick={() => chooseCash(option)}
									>
										{formatMoney(option)}
									</button>
								{/each}
								<Input
									inputmode="numeric"
									placeholder="Otro valor"
									class="h-10 w-32 rounded-full text-sm"
									value={customCash}
									oninput={(event) => {
										customCash = event.currentTarget.value;

										const digits = customCash.replace(/\D/g, '');

										cashTendered = digits === '' ? null : Number(digits);
									}}
								/>
							</div>
							{#if cashTendered !== null && cashTendered >= total}
								<p class="text-sm text-success">
									Te llevamos <span class="tabular font-semibold"
										>{formatMoney(changeFor(total, cashTendered))}</span
									> de cambio.
								</p>
							{:else if cashTendered !== null}
								<p class="text-sm text-destructive">
									Con eso no alcanza: el total es {formatMoney(total)}.
								</p>
							{/if}
						</div>
					{/if}
				</section>

				<section class="flex flex-col gap-3 rounded-3xl bg-background p-5 text-sm shadow-sm">
					<label class="flex items-start gap-3">
						<input
							type="checkbox"
							name="consentService"
							bind:checked={consentService}
							class="mt-0.5 size-5 shrink-0 accent-primary"
						/>
						<span>
							Autorizo a <strong>{menu.restaurant.name}</strong> a usar mis datos para preparar, entregar
							y avisarme de este pedido, según la Ley 1581 de 2012.
						</span>
					</label>
					{#if errorOf('consentService')}
						<p class="font-medium text-destructive">{errorOf('consentService')}</p>
					{/if}
					<label class="flex items-start gap-3">
						<input
							type="checkbox"
							name="consentMarketing"
							bind:checked={consentMarketing}
							class="mt-0.5 size-5 shrink-0 accent-primary"
						/>
						<span class="text-muted-foreground">
							Quiero recibir promociones de {menu.restaurant.name} por WhatsApp. (Opcional)
						</span>
					</label>
				</section>
			</div>

			<aside class="lg:col-span-2">
				<div
					class="flex flex-col gap-5 rounded-3xl bg-background p-5 shadow-sm lg:sticky lg:top-24"
				>
					<OrderSummary lines={cart.lines} {preview} {delivery} />

					{#if form?.orderError}
						<p class="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">
							{form.orderError}
						</p>
					{/if}

					<Button
						type="submit"
						class="hidden h-14 w-full text-base lg:flex"
						disabled={!canSubmit || !consentService}
					>
						{submitting ? 'Enviando tu pedido…' : `Hacer pedido · ${formatMoney(total)}`}
					</Button>
				</div>
			</aside>

			<!-- En el celular el botón queda fijo abajo, siempre a la mano. -->
			<div
				class="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 pb-safe backdrop-blur lg:hidden"
			>
				<Button
					type="submit"
					class="h-14 w-full rounded-full text-base"
					disabled={!canSubmit || !consentService}
				>
					{submitting ? 'Enviando tu pedido…' : `Hacer pedido · ${formatMoney(total)}`}
				</Button>
			</div>
		</form>
	{/if}
</div>
