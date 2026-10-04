<script lang="ts">
	import type { CartLine } from '$lib/domain/cart';
	import type { Item, OpenStatus } from '$lib/domain/menu';

	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';

	import { Button } from '$lib/components/atoms/button';
	import { Separator } from '$lib/components/atoms/separator';
	import CartLineRow from '$lib/components/molecules/CartLineRow.svelte';
	import SuggestionCard from '$lib/components/molecules/SuggestionCard.svelte';
	import { cn } from '$lib/utils';
	import { formatMoney } from '$lib/utils/money';

	interface Props {
		lines: CartLine[];
		/** Subtotal orientativo, calculado con la vista previa de cada línea. */
		previewSubtotal: number;
		status: OpenStatus;
		/** A dónde lleva "Continuar": el checkout del restaurante. */
		checkoutHref: string;
		onQty: (key: string, qty: number) => void;
		onRemove: (key: string) => void;
		/** "¿Le sumas algo?": lo que combina con lo que ya lleva el pedido. */
		suggestions?: Item[];
		inCart?: (itemId: string) => number;
		onQuickAdd?: (item: Item) => void;
		/**
		 * El título lo pone quien envuelve el panel cuando es un drawer (necesita
		 * su propio componente de título para accesibilidad).
		 */
		showTitle?: boolean;
		class?: string;
	}

	let {
		lines,
		previewSubtotal,
		status,
		checkoutHref,
		onQty,
		onRemove,
		suggestions = [],
		inCart = () => 0,
		onQuickAdd = () => {},
		showTitle = true,
		class: className
	}: Props = $props();

	const count = $derived(lines.reduce((sum, line) => sum + line.qty, 0));
</script>

<div class={cn('flex min-h-0 flex-col', className)}>
	{#if showTitle}
		<div class="flex items-baseline justify-between px-4 pt-4">
			<h2 class="font-display text-2xl font-extrabold tracking-tight">Tu pedido</h2>
			{#if count > 0}
				<span class="text-sm text-muted-foreground">
					{count}
					{count === 1 ? 'producto' : 'productos'}
				</span>
			{/if}
		</div>
	{/if}

	<div class="flex min-h-0 flex-1 flex-col overflow-y-auto px-4">
		{#if lines.length === 0}
			<div class="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
				<ShoppingBag class="size-10" />
				<p class="font-medium text-foreground">Tu pedido está vacío</p>
				<p class="text-sm">Toca un producto de la carta para agregarlo.</p>
			</div>
		{:else}
			{#each lines as line, index (line.key)}
				{#if index > 0}
					<Separator />
				{/if}
				<CartLineRow {line} {onQty} {onRemove} />
			{/each}

			{#if suggestions.length > 0}
				<section class="flex flex-col gap-3 py-4" aria-labelledby="le-sumas-algo">
					<h3 id="le-sumas-algo" class="font-display text-lg font-bold">¿Le sumas algo?</h3>
					<div class="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 scrollbar-none">
						{#each suggestions as suggestion (suggestion.id)}
							<SuggestionCard item={suggestion} inCart={inCart(suggestion.id)} onAdd={onQuickAdd} />
						{/each}
					</div>
				</section>
			{/if}
		{/if}
	</div>

	{#if lines.length > 0}
		<div class="flex flex-col gap-3 border-t border-border p-4">
			<div class="flex items-center justify-between text-base">
				<span class="font-medium">Subtotal</span>
				<span class="tabular text-lg font-bold">{formatMoney(previewSubtotal)}</span>
			</div>

			{#if !status.open}
				<p class="text-sm font-medium text-caution">{status.label}</p>
				<Button type="button" class="h-12 w-full text-base" disabled>Continuar</Button>
			{:else}
				<Button href={checkoutHref} class="h-12 w-full text-base">
					Continuar
					<ArrowRight class="size-4" />
				</Button>
			{/if}
		</div>
	{/if}
</div>
