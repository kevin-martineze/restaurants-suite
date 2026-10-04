<script lang="ts">
	import type { Menu } from '$lib/domain/menu';

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

<header class="flex flex-col gap-4 px-4 pt-6 pb-4">
	<div class="flex items-center gap-3">
		{#if menu.restaurant.logoUrl}
			<img
				src={menu.restaurant.logoUrl}
				alt=""
				class="size-14 shrink-0 rounded-full border border-border object-cover"
			/>
		{:else}
			<div
				class="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground"
				aria-hidden="true"
			>
				{initials}
			</div>
		{/if}
		<div class="flex min-w-0 flex-col">
			<h1 class="text-xl leading-tight font-bold">{menu.restaurant.name}</h1>
			{#if menu.restaurant.tagline}
				<p class="text-sm text-muted-foreground">{menu.restaurant.tagline}</p>
			{/if}
		</div>
	</div>

	<p
		class={cn(
			'flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-medium',
			menu.status.open ? 'bg-success/10 text-success' : 'bg-caution/10 text-caution'
		)}
	>
		<span
			class={cn('size-2 rounded-full', menu.status.open ? 'bg-success' : 'bg-caution')}
			aria-hidden="true"
		></span>
		{menu.status.label}
	</p>

	<div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
		<span class="flex items-center gap-1">
			<Clock class="size-4" />
			~{menu.branch.etaMinutes} min
		</span>
		<span class="flex items-center gap-1">
			<MapPin class="size-4" />
			{menu.branch.address}
		</span>
		<span>{menu.branch.fulfillment.map((type) => FULFILLMENT_LABEL[type]).join(' · ')}</span>
	</div>
</header>
