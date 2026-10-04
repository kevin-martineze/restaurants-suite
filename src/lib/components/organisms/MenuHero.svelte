<script lang="ts">
	import type { Menu } from '$lib/domain/menu';

	import Bike from '@lucide/svelte/icons/bike';
	import ChefHat from '@lucide/svelte/icons/chef-hat';
	import Clock from '@lucide/svelte/icons/clock';
	import MapPin from '@lucide/svelte/icons/map-pin';

	import { FULFILLMENT_LABEL } from '$lib/domain/menu';
	import { cn } from '$lib/utils';

	interface Props {
		menu: Menu;
	}

	let { menu }: Props = $props();

	const initials = $derived(
		menu.restaurant.name
			.split(/\s+/)
			.filter((word) => word.length > 2)
			.slice(0, 2)
			.map((word) => word[0]?.toUpperCase() ?? '')
			.join('')
	);

	// Cápsula de vidrio sobre la foto: se lee sobre cualquier imagen.
	const glass =
		'flex items-center gap-1.5 rounded-full bg-background/15 px-3 py-1.5 ring-1 ring-background/25 backdrop-blur-md';
</script>

<header
	class="relative isolate flex min-h-80 flex-col justify-end overflow-hidden bg-foreground sm:min-h-96 lg:mt-6 lg:rounded-3xl"
>
	{#if menu.restaurant.coverUrl}
		<img
			src={menu.restaurant.coverUrl}
			alt=""
			fetchpriority="high"
			class="absolute inset-0 -z-10 size-full object-cover"
		/>
	{/if}
	<div
		class="absolute inset-0 -z-10 bg-linear-to-t from-foreground via-foreground/55 to-foreground/10"
	></div>

	<div class="flex flex-col gap-4 p-5 text-background sm:p-8">
		<div class="flex items-end gap-4">
			{#if menu.restaurant.logoUrl}
				<img
					src={menu.restaurant.logoUrl}
					alt=""
					class="size-16 shrink-0 rounded-2xl bg-background object-cover shadow-lg ring-2 ring-background/60 sm:size-20"
				/>
			{:else}
				<div
					class="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary title text-2xl text-primary-foreground shadow-lg ring-2 ring-background/60 sm:size-20 sm:text-3xl"
					aria-hidden="true"
				>
					{initials}
				</div>
			{/if}
			<div class="flex min-w-0 flex-col">
				<h1 class="title text-3xl leading-none text-balance sm:text-5xl lg:text-6xl">
					{menu.restaurant.name}
				</h1>
				{#if menu.restaurant.tagline}
					<p class="mt-1.5 text-background/80 sm:text-lg">{menu.restaurant.tagline}</p>
				{/if}
			</div>
		</div>

		<div class="flex flex-wrap items-center gap-2 text-sm font-medium">
			<span
				class={cn(
					'flex items-center gap-2 rounded-full px-3 py-1.5 shadow-sm',
					menu.status.open
						? 'bg-success text-success-foreground'
						: 'bg-caution text-caution-foreground'
				)}
			>
				<span class="relative flex size-2" aria-hidden="true">
					{#if menu.status.open}
						<span class="absolute inline-flex size-full animate-ping rounded-full bg-background/70"
						></span>
					{/if}
					<span class="relative inline-flex size-2 rounded-full bg-background"></span>
				</span>
				{menu.status.label}
			</span>
			{#if menu.status.open}
				<span
					class={cn(
						glass,
						menu.kitchen.load === 'busy' && 'bg-caution text-caution-foreground ring-0',
						menu.kitchen.load === 'saturated' && 'bg-destructive text-destructive-foreground ring-0'
					)}
					title="El tiempo ya cuenta cuántos pedidos tiene la cocina ahora."
				>
					<ChefHat class="size-4" />
					{menu.kitchen.label} · ~{menu.branch.etaMinutes} min
				</span>
			{:else}
				<!-- Cerrado: el estado de la cocina no dice nada; el tiempo sí orienta. -->
				<span class={glass}>
					<Clock class="size-4" />
					~{menu.branch.etaMinutes} min
				</span>
			{/if}
			<span class={glass}>
				<Bike class="size-4" />
				{menu.branch.fulfillment.map((type) => FULFILLMENT_LABEL[type]).join(' · ')}
			</span>
			<span class={cn(glass, 'max-sm:hidden')}>
				<MapPin class="size-4" />
				{menu.branch.address}
			</span>
		</div>
	</div>
</header>
