<script lang="ts">
	import type { Menu } from '$lib/domain/menu';

	import Bike from '@lucide/svelte/icons/bike';
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
</script>

<header>
	<div class="relative h-44 overflow-hidden bg-muted sm:h-60 lg:mt-6 lg:h-72 lg:rounded-2xl">
		{#if menu.restaurant.coverUrl}
			<img
				src={menu.restaurant.coverUrl}
				alt=""
				fetchpriority="high"
				class="size-full object-cover"
			/>
		{/if}
		<div class="absolute inset-0 bg-linear-to-t from-foreground/40 to-transparent"></div>
	</div>

	<div class="relative -mt-10 flex flex-col gap-3 px-4 lg:-mt-12 lg:px-6">
		{#if menu.restaurant.logoUrl}
			<img
				src={menu.restaurant.logoUrl}
				alt=""
				class="size-20 rounded-2xl border-4 border-background bg-background object-cover shadow-md lg:size-24"
			/>
		{:else}
			<div
				class="flex size-20 items-center justify-center rounded-2xl border-4 border-background bg-primary text-2xl font-extrabold text-primary-foreground shadow-md lg:size-24"
				aria-hidden="true"
			>
				{initials}
			</div>
		{/if}

		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
				{menu.restaurant.name}
			</h1>
			{#if menu.restaurant.tagline}
				<p class="text-muted-foreground sm:text-lg">{menu.restaurant.tagline}</p>
			{/if}
		</div>

		<div class="flex flex-wrap items-center gap-2 text-sm">
			<span
				class={cn(
					'flex items-center gap-2 rounded-full px-3 py-1 font-medium',
					menu.status.open ? 'bg-success/10 text-success' : 'bg-caution/10 text-caution'
				)}
			>
				<span
					class={cn('size-2 rounded-full', menu.status.open ? 'bg-success' : 'bg-caution')}
					aria-hidden="true"
				></span>
				{menu.status.label}
			</span>
			<span class="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1">
				<Clock class="size-4" />
				~{menu.branch.etaMinutes} min
			</span>
			<span class="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1">
				<Bike class="size-4" />
				{menu.branch.fulfillment.map((type) => FULFILLMENT_LABEL[type]).join(' · ')}
			</span>
			<span class="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1">
				<MapPin class="size-4" />
				{menu.branch.address}
			</span>
		</div>
	</div>
</header>
