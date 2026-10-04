<script lang="ts">
	import type { Item } from '$lib/domain/menu';

	import Plus from '@lucide/svelte/icons/plus';
	import UtensilsCrossed from '@lucide/svelte/icons/utensils-crossed';

	import ItemTagBadge from '$lib/components/molecules/ItemTagBadge.svelte';
	import { cn } from '$lib/utils';
	import { formatMoney } from '$lib/utils/money';

	interface Props {
		item: Item;
		/** Cuántas unidades de este producto hay en el carrito (cualquier opción). */
		inCart?: number;
		onSelect: (item: Item) => void;
	}

	let { item, inCart = 0, onSelect }: Props = $props();

	// En la foto cabe una etiqueta sin tapar la comida: la primera manda.
	const tag = $derived(item.tags[0] ?? null);
</script>

<button
	type="button"
	class="group flex flex-col gap-2.5 text-left focus-visible:outline-none disabled:cursor-not-allowed"
	disabled={!item.available}
	onclick={() => onSelect(item)}
>
	<div
		class={cn(
			'relative aspect-square w-full overflow-hidden rounded-2xl bg-muted ring-ring/50 transition-shadow group-focus-visible:ring-3',
			inCart > 0 && 'ring-2 ring-primary'
		)}
	>
		{#if item.imageUrl}
			<img
				src={item.imageUrl}
				alt=""
				loading="lazy"
				decoding="async"
				class={cn(
					'size-full object-cover transition-transform duration-500 group-enabled:group-hover:scale-105',
					!item.available && 'opacity-60 grayscale'
				)}
			/>
		{:else}
			<div class="flex size-full items-center justify-center text-muted-foreground">
				<UtensilsCrossed class="size-8" />
			</div>
		{/if}

		{#if !item.available}
			<span
				class="absolute top-2 left-2 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold"
			>
				Agotado
			</span>
		{:else if tag}
			<ItemTagBadge {tag} class="absolute top-2 left-2" />
		{/if}

		{#if item.available}
			<span
				class={cn(
					'absolute right-2 bottom-2 flex size-10 items-center justify-center rounded-full shadow-lg transition-transform group-hover:scale-110',
					inCart > 0
						? 'bg-background font-bold text-primary ring-2 ring-primary'
						: 'bg-primary text-primary-foreground'
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
		{#if inCart > 0}
			<span class="sr-only">Tienes {inCart} en tu pedido</span>
		{/if}
	</div>
</button>
