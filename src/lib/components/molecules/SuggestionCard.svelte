<script lang="ts">
	import type { Item } from '$lib/domain/menu';

	import Check from '@lucide/svelte/icons/check';
	import Plus from '@lucide/svelte/icons/plus';
	import UtensilsCrossed from '@lucide/svelte/icons/utensils-crossed';

	import { cn } from '$lib/utils';
	import { formatMoney } from '$lib/utils/money';

	interface Props {
		item: Item;
		/** Unidades de este producto que ya hay en el pedido. */
		inCart: number;
		onAdd: (item: Item) => void;
	}

	let { item, inCart, onAdd }: Props = $props();
</script>

<button
	type="button"
	class="group flex w-32 shrink-0 snap-start flex-col gap-1.5 text-left"
	onclick={() => onAdd(item)}
>
	<div class="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
		{#if item.imageUrl}
			<img
				src={item.imageUrl}
				alt=""
				loading="lazy"
				decoding="async"
				class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
			/>
		{:else}
			<div class="flex size-full items-center justify-center text-muted-foreground">
				<UtensilsCrossed class="size-6" />
			</div>
		{/if}
		<span
			class={cn(
				'absolute right-1.5 bottom-1.5 flex h-8 min-w-8 items-center justify-center gap-0.5 rounded-full px-2 text-sm font-bold shadow-md transition-colors',
				inCart > 0 ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground'
			)}
			aria-hidden="true"
		>
			{#if inCart > 0}
				<Check class="size-4" />
				<span class="tabular">{inCart}</span>
			{:else}
				<Plus class="size-4" />
			{/if}
		</span>
	</div>
	<span class="line-clamp-1 text-sm font-semibold">{item.name}</span>
	<span class="tabular -mt-1 text-sm text-muted-foreground">+{formatMoney(item.price)}</span>
	<span class="sr-only">
		{inCart > 0 ? `Llevas ${inCart}. Toca para agregar otro.` : 'Toca para agregarlo a tu pedido.'}
	</span>
</button>
