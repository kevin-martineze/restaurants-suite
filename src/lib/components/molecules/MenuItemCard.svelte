<script lang="ts">
	import type { Item } from '$lib/domain/menu';

	import Plus from '@lucide/svelte/icons/plus';
	import UtensilsCrossed from '@lucide/svelte/icons/utensils-crossed';

	import { cn } from '$lib/utils';
	import { formatMoney } from '$lib/utils/money';

	interface Props {
		item: Item;
		onSelect: (item: Item) => void;
	}

	let { item, onSelect }: Props = $props();
</script>

<button
	type="button"
	class="group flex flex-col gap-2 text-left focus-visible:outline-none disabled:cursor-not-allowed"
	disabled={!item.available}
	onclick={() => onSelect(item)}
>
	<div
		class="relative aspect-square w-full overflow-hidden rounded-xl bg-muted ring-ring/40 group-focus-visible:ring-3"
	>
		{#if item.imageUrl}
			<img
				src={item.imageUrl}
				alt=""
				loading="lazy"
				decoding="async"
				class={cn(
					'size-full object-cover transition-transform duration-300 group-enabled:group-hover:scale-105',
					!item.available && 'opacity-60 grayscale'
				)}
			/>
		{:else}
			<div class="flex size-full items-center justify-center text-muted-foreground">
				<UtensilsCrossed class="size-8" />
			</div>
		{/if}

		{#if item.available}
			<span
				class="absolute right-2 bottom-2 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-110"
				aria-hidden="true"
			>
				<Plus class="size-5" />
			</span>
		{:else}
			<span
				class="absolute top-2 left-2 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold"
			>
				Agotado
			</span>
		{/if}
	</div>

	<div class="flex flex-col gap-0.5 px-0.5">
		<span class="line-clamp-2 leading-snug font-semibold">{item.name}</span>
		{#if item.description}
			<span class="line-clamp-2 text-sm text-muted-foreground max-sm:hidden">
				{item.description}
			</span>
		{/if}
		<span class={cn('tabular font-bold', !item.available && 'text-muted-foreground')}>
			{formatMoney(item.price)}
		</span>
	</div>
</button>
