<script lang="ts">
	import type { PageData } from './$types';
	import type { OrderStatus } from '$lib/domain/checkout';

	import Banknote from '@lucide/svelte/icons/banknote';
	import Check from '@lucide/svelte/icons/check';
	import CreditCard from '@lucide/svelte/icons/credit-card';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Store from '@lucide/svelte/icons/store';

	import { untrack } from 'svelte';

	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';

	import { Button } from '$lib/components/atoms/button';
	import { Separator } from '$lib/components/atoms/separator';
	import { changeFor, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from '$lib/domain/checkout';
	import { themeStyle } from '$lib/domain/theme';
	import { cart } from '$lib/stores/cart.svelte';
	import { cn } from '$lib/utils';
	import { formatMoney } from '$lib/utils/money';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const order = $derived(data.order);
	const style = $derived(data.theme ? themeStyle(data.theme) : '');
	const delivery = $derived(order.fulfillment === 'delivery');

	// El camino que recorre el pedido, según cómo se entrega.
	const steps = $derived<OrderStatus[]>(
		delivery
			? ['received', 'accepted', 'preparing', 'dispatched', 'delivered']
			: ['received', 'accepted', 'preparing', 'ready', 'picked_up']
	);
	const currentIndex = $derived(steps.indexOf(order.status));

	const createdAt = $derived(
		new Intl.DateTimeFormat('es-CO', {
			hour: 'numeric',
			minute: '2-digit',
			timeZone: 'America/Bogota'
		}).format(new Date(order.createdAt))
	);

	// Recién hecho el pedido: se vacía el carrito y se quita la marca de la URL,
	// para que recargar o compartir el enlace no lo vuelva a hacer.
	$effect(() => {
		if (!data.fresh) return;

		const slug = order.restaurant.slug;

		untrack(() => {
			cart.hydrate(slug);
			cart.clear();

			const url = new URL(page.url);

			url.searchParams.delete('new');
			replaceState(url, {});
		});
	});
</script>

<svelte:head>
	<title>Pedido #{order.number} · {order.restaurant.name}</title>
</svelte:head>

<div {style} class="min-h-dvh bg-secondary/40 pb-16">
	<main class="mx-auto flex max-w-xl flex-col gap-5 px-4 pt-10">
		<section class="flex flex-col items-center gap-3 text-center">
			<span
				class="flex size-20 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg"
			>
				<Check class="size-10" strokeWidth={3} />
			</span>
			<h1 class="title text-3xl sm:text-4xl">
				¡Pedido recibido, {order.customerName.split(' ')[0]}!
			</h1>
			<p class="text-muted-foreground">
				{order.restaurant.name} ya lo tiene. Pedido
				<span class="font-bold text-foreground">#{order.number}</span> · {createdAt}
			</p>
		</section>

		<section class="flex flex-col gap-4 rounded-3xl bg-background p-5 shadow-sm">
			<div class="flex items-baseline justify-between">
				<h2 class="title text-xl">{ORDER_STATUS_LABEL[order.status]}</h2>
				<span class="text-sm text-muted-foreground">
					{delivery ? 'Llega' : 'Listo'} en unos {order.etaMinutes} min
				</span>
			</div>
			<ol class="flex items-center gap-1.5" aria-label="Avance del pedido">
				{#each steps as step, index (step)}
					<li class="flex flex-1 flex-col gap-1.5">
						<span
							class={cn(
								'h-1.5 rounded-full',
								index <= currentIndex ? 'bg-primary' : 'bg-secondary',
								index === currentIndex && 'animate-pulse'
							)}
						></span>
						<span
							class={cn(
								'text-xs',
								index <= currentIndex ? 'font-semibold' : 'text-muted-foreground'
							)}
						>
							{ORDER_STATUS_LABEL[step]}
						</span>
					</li>
				{/each}
			</ol>
			<p class="text-sm text-muted-foreground">Guarda este enlace: aquí verás cómo va tu pedido.</p>
		</section>

		<section class="flex flex-col gap-4 rounded-3xl bg-background p-5 shadow-sm">
			<div class="flex items-start gap-3">
				<span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
					{#if delivery}
						<MapPin class="size-5" />
					{:else}
						<Store class="size-5" />
					{/if}
				</span>
				<div class="flex flex-col">
					<span class="font-semibold">{delivery ? 'Domicilio a' : 'Recoges en'}</span>
					{#if delivery && order.address}
						<span>{order.address.text}</span>
						<span class="text-sm text-muted-foreground">
							{[order.address.neighborhood, order.address.references].filter(Boolean).join(' · ')}
						</span>
					{:else}
						<span>{order.branch.name}</span>
						<span class="text-sm text-muted-foreground">{order.branch.address}</span>
					{/if}
				</div>
			</div>

			<div class="flex items-start gap-3">
				<span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
					{#if order.payment.method === 'cash'}
						<Banknote class="size-5" />
					{:else}
						<CreditCard class="size-5" />
					{/if}
				</span>
				<div class="flex flex-col">
					<span class="font-semibold">{PAYMENT_METHOD_LABEL[order.payment.method]}</span>
					{#if order.payment.method === 'cash' && order.payment.cashTendered !== null}
						<span class="text-sm text-muted-foreground">
							Pagas con {formatMoney(order.payment.cashTendered)}; te llevamos
							{formatMoney(changeFor(order.totals.total, order.payment.cashTendered))} de cambio.
						</span>
					{:else if order.payment.method === 'cash'}
						<span class="text-sm text-muted-foreground">Pagas el valor exacto.</span>
					{:else}
						<span class="text-sm text-muted-foreground">
							{delivery ? 'El domiciliario lleva el datáfono.' : 'Pagas en la caja.'}
						</span>
					{/if}
				</div>
			</div>
		</section>

		<section class="flex flex-col gap-3 rounded-3xl bg-background p-5 shadow-sm">
			<h2 class="title text-xl">Lo que pediste</h2>
			<ul class="flex flex-col gap-3">
				{#each order.items as item, index (index)}
					<li class="flex items-start justify-between gap-3">
						<div class="flex min-w-0 flex-col">
							<span class="font-medium">
								<span class="tabular text-muted-foreground">{item.qty}×</span>
								{item.name}
							</span>
							{#if item.modifiersLabel}
								<span class="text-sm text-muted-foreground">{item.modifiersLabel}</span>
							{/if}
							{#if item.note}
								<span class="text-sm text-muted-foreground italic">«{item.note}»</span>
							{/if}
						</div>
						<span class="tabular shrink-0">{formatMoney(item.total)}</span>
					</li>
				{/each}
			</ul>
			<Separator />
			<dl class="flex flex-col gap-1.5">
				<div class="flex justify-between text-muted-foreground">
					<dt>Subtotal</dt>
					<dd class="tabular">{formatMoney(order.totals.subtotal)}</dd>
				</div>
				{#if delivery}
					<div class="flex justify-between text-muted-foreground">
						<dt>Domicilio</dt>
						<dd class="tabular">{formatMoney(order.totals.deliveryFee)}</dd>
					</div>
				{/if}
				<div class="flex items-baseline justify-between pt-1">
					<dt class="title text-lg">Total</dt>
					<dd class="tabular title text-2xl">
						{formatMoney(order.totals.total)}
					</dd>
				</div>
			</dl>
		</section>

		<Button href={`/${order.restaurant.slug}`} variant="outline" class="h-12 text-base">
			Volver a la carta
		</Button>
	</main>
</div>
