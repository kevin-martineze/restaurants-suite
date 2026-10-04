<script lang="ts">
	import type { Item } from '$lib/domain/menu';

	import { Badge } from '$lib/components/atoms/badge';
	import { formatMoney } from '$lib/utils/money';

	interface Props {
		item: Item;
		onSelect: (item: Item) => void;
	}

	let { item, onSelect }: Props = $props();
</script>

<button
	type="button"
	class="flex w-full items-start gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent/60 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
	disabled={!item.available}
	onclick={() => onSelect(item)}
>
	<div class="flex min-w-0 flex-1 flex-col gap-1">
		<span class="font-semibold">{item.name}</span>
		{#if item.description}
			<span class="line-clamp-2 text-sm text-muted-foreground">{item.description}</span>
		{/if}
		<div class="mt-1 flex items-center gap-2">
			<span class="tabular font-semibold">{formatMoney(item.price)}</span>
			{#if !item.available}
				<Badge variant="secondary">Agotado</Badge>
			{/if}
		</div>
	</div>

	{#if item.imageUrl}
		<img
			src={item.imageUrl}
			alt=""
			loading="lazy"
			class="size-20 shrink-0 rounded-md bg-muted object-cover"
		/>
	{/if}
</button>
