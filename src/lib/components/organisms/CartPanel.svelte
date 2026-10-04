<script lang="ts">
	import type { CartLine, Quote } from '$lib/domain/cart';
	import type { Item, OpenStatus } from '$lib/domain/menu';

	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';

	import { enhance } from '$app/forms';

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
		/** Lo que se manda a la form action: solo identificadores y cantidades. */
		cartPayload: string;
		/** Cotización del servidor, solo si corresponde al carrito actual. */
		quote: Quote | null;
		quoteError: string | null;
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
		cartPayload,
		quote,
		quoteError,
		onQty,
		onRemove,
		suggestions = [],
		inCart = () => 0,
		onQuickAdd = () => {},
		showTitle = true,
		class: className
	}: Props = $props();

	let submitting = $state(false);

	const problems = $derived(new Map(quote?.rejected.map((line) => [line.key, line.reason]) ?? []));
	const ready = $derived(quote !== null && quote.rejected.length === 0);
	const subtotal = $derived(quote && ready ? quote.subtotal : previewSubtotal);
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
				<CartLineRow {line} problem={problems.get(line.key) ?? null} {onQty} {onRemove} />
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
				<span class="tabular text-lg font-bold">{formatMoney(subtotal)}</span>
			</div>

			{#if quoteError}
				<p class="text-sm font-medium text-destructive">{quoteError}</p>
			{:else if quote && quote.rejected.length > 0}
				<p class="text-sm font-medium text-destructive">
					Hay productos que no podemos preparar. Ajústalos para continuar.
				</p>
			{:else if ready}
				<p class="flex items-start gap-2 rounded-md bg-success/10 p-3 text-sm text-success">
					<CircleCheck class="mt-0.5 size-4 shrink-0" />
					Todo listo. Muy pronto podrás elegir la entrega y pagar aquí mismo.
				</p>
			{/if}

			{#if !status.open}
				<p class="text-sm font-medium text-caution">{status.label}</p>
			{/if}

			<form
				method="POST"
				action="?/quote"
				use:enhance={() => {
					submitting = true;

					return async ({ update }) => {
						await update({ reset: false, invalidateAll: false });
						submitting = false;
					};
				}}
			>
				<input type="hidden" name="cart" value={cartPayload} />
				<Button type="submit" class="h-12 w-full text-base" disabled={!status.open || submitting}>
					{submitting ? 'Revisando…' : 'Continuar'}
				</Button>
			</form>
		</div>
	{/if}
</div>
