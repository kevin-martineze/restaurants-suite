<script lang="ts">
	import type { CartLine } from '$lib/domain/cart';

	import Trash from '@lucide/svelte/icons/trash-2';

	import QuantityStepper from '$lib/components/molecules/QuantityStepper.svelte';
	import { MAX_QTY_PER_LINE } from '$lib/domain/cart';
	import { formatMoney } from '$lib/utils/money';

	interface Props {
		line: CartLine;
		/** Motivo por el que el servidor no aceptó la línea, si lo hay. */
		problem?: string | null;
		onQty: (key: string, qty: number) => void;
		onRemove: (key: string) => void;
	}

	let { line, problem = null, onQty, onRemove }: Props = $props();
</script>

<div class="flex flex-col gap-2 py-3">
	<div class="flex items-start justify-between gap-3">
		<div class="flex min-w-0 flex-col">
			<span class="font-medium">{line.preview.name}</span>
			{#if line.preview.modifiersLabel}
				<span class="text-sm text-muted-foreground">{line.preview.modifiersLabel}</span>
			{/if}
			{#if line.note}
				<span class="text-sm text-muted-foreground italic">«{line.note}»</span>
			{/if}
		</div>
		<span class="tabular shrink-0 font-semibold">
			{formatMoney(line.preview.unitPrice * line.qty)}
		</span>
	</div>

	{#if problem}
		<p class="text-sm font-medium text-destructive">{problem}</p>
	{/if}

	<div class="flex items-center justify-between">
		<QuantityStepper
			size="sm"
			value={line.qty}
			max={MAX_QTY_PER_LINE}
			label={`Cantidad de ${line.preview.name}`}
			onChange={(qty) => onQty(line.key, qty)}
		/>
		<button
			type="button"
			class="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:text-destructive"
			onclick={() => onRemove(line.key)}
		>
			<Trash class="size-4" />
			Quitar
		</button>
	</div>
</div>
