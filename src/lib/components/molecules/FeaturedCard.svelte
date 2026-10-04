<script lang="ts">
	import type { Item } from '$lib/domain/menu';

	import Plus from '@lucide/svelte/icons/plus';

	import { cn } from '$lib/utils';
	import { formatMoney } from '$lib/utils/money';

	interface Props {
		item: Item;
		/** Posición en el ranking: "#1", "#2"… */
		rank: number;
		inCart?: number;
		onSelect: (item: Item) => void;
	}

	let { item, rank, inCart = 0, onSelect }: Props = $props();
</script>

<button
	type="button"
	class="group relative flex aspect-video w-72 shrink-0 snap-start overflow-hidden rounded-3xl bg-muted text-left shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed sm:w-80"
	disabled={!item.available}
	onclick={() => onSelect(item)}
>
	{#if item.imageUrl}
		<img
			src={item.imageUrl}
			alt=""
			loading="lazy"
			decoding="async"
			class={cn(
				'absolute inset-0 size-full object-cover transition-transform duration-500 group-enabled:group-hover:scale-105',
				!item.available && 'opacity-60 grayscale'
			)}
		/>
	{/if}
	<div
		class="absolute inset-0 bg-linear-to-t from-foreground/85 via-foreground/20 to-transparent"
	></div>

	<span class="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 title text-sm">
		#{rank}
	</span>

	<div class="relative mt-auto flex w-full items-end justify-between gap-3 p-4 text-background">
		<div class="flex min-w-0 flex-col">
			<span class="truncate title text-xl leading-tight">{item.name}</span>
			<span class="tabular font-semibold text-background/85">
				{item.available ? formatMoney(item.price) : 'Agotado'}
			</span>
		</div>
		{#if item.available}
			<span
				class={cn(
					'flex size-10 shrink-0 items-center justify-center rounded-full shadow-lg',
					inCart > 0 ? 'bg-background font-bold text-primary' : 'bg-primary text-primary-foreground'
				)}
				aria-hidden="true"
			>
				{#if inCart > 0}
					<span class="tabular">{inCart}</span>
				{:else}
					<Plus class="size-5" />
				{/if}
			</span>
		{/if}
	</div>
</button>
