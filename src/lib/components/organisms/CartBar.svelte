<script lang="ts">
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';

	import { formatMoney } from '$lib/utils/money';

	interface Props {
		count: number;
		subtotal: number;
		onOpen: () => void;
	}

	let { count, subtotal, onOpen }: Props = $props();
</script>

<div
	class="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 pb-safe backdrop-blur"
>
	<button
		type="button"
		class="mx-auto flex h-12 w-full max-w-lg items-center justify-between rounded-lg bg-primary px-4 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
		onclick={onOpen}
	>
		<span class="flex items-center gap-2">
			<ShoppingBag class="size-5" />
			Ver carrito
			<span
				class="tabular rounded-full bg-primary-foreground px-2 text-sm text-primary"
				aria-label={`${count} productos`}
			>
				{count}
			</span>
		</span>
		<span class="tabular">{formatMoney(subtotal)}</span>
	</button>
</div>
