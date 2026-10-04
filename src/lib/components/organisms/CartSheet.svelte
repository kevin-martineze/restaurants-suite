<script lang="ts">
	import type { CartLine, Quote } from '$lib/domain/cart';
	import type { OpenStatus } from '$lib/domain/menu';

	import CircleCheck from '@lucide/svelte/icons/circle-check';

	import { enhance } from '$app/forms';

	import { Button } from '$lib/components/atoms/button';
	import * as Drawer from '$lib/components/atoms/drawer';
	import { Separator } from '$lib/components/atoms/separator';
	import CartLineRow from '$lib/components/molecules/CartLineRow.svelte';
	import { formatMoney } from '$lib/utils/money';

	interface Props {
		open: boolean;
		themeStyle: string;
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
	}

	let {
		open = $bindable(),
		themeStyle,
		lines,
		previewSubtotal,
		status,
		cartPayload,
		quote,
		quoteError,
		onQty,
		onRemove
	}: Props = $props();

	let submitting = $state(false);

	const problems = $derived(new Map(quote?.rejected.map((line) => [line.key, line.reason]) ?? []));
	const ready = $derived(quote !== null && quote.rejected.length === 0);
	const subtotal = $derived(quote && ready ? quote.subtotal : previewSubtotal);
</script>

<Drawer.Root bind:open shouldScaleBackground={false}>
	<Drawer.Content style={themeStyle} class="mx-auto max-w-lg">
		<Drawer.Header class="text-left">
			<Drawer.Title class="text-xl font-bold">Tu pedido</Drawer.Title>
			<Drawer.Description>Revisa los productos antes de continuar.</Drawer.Description>
		</Drawer.Header>

		<div class="flex min-h-0 flex-1 flex-col overflow-y-auto px-4">
			{#if lines.length === 0}
				<p class="py-8 text-center text-muted-foreground">Tu carrito está vacío.</p>
			{:else}
				{#each lines as line, index (line.key)}
					{#if index > 0}
						<Separator />
					{/if}
					<CartLineRow {line} problem={problems.get(line.key) ?? null} {onQty} {onRemove} />
				{/each}
			{/if}
		</div>

		<Drawer.Footer class="border-t border-border bg-popover">
			<div class="flex items-center justify-between text-base">
				<span class="font-medium">Subtotal</span>
				<span class="tabular font-bold">{formatMoney(subtotal)}</span>
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
				<Button
					type="submit"
					class="h-12 w-full text-base"
					disabled={lines.length === 0 || !status.open || submitting}
				>
					{submitting ? 'Revisando…' : 'Continuar'}
				</Button>
			</form>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
