<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';

	import { formatMoney } from '$lib/utils/money';

	interface Props {
		count: number;
		subtotal: number;
		onOpen: () => void;
	}

	let { count, subtotal, onOpen }: Props = $props();
</script>

<div class="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pb-safe">
	<!-- Se monta de nuevo con cada cambio de cantidad: así rebota al agregar. -->
	{#key count}
		<button
			type="button"
			class="pointer-events-auto mx-auto flex h-14 w-full max-w-lg animate-bump items-center gap-3 rounded-full bg-foreground pr-2 pl-5 text-background shadow-2xl transition-transform active:scale-95"
			onclick={onOpen}
		>
			<span class="relative">
				<ShoppingBag class="size-5" />
				<span
					class="tabular absolute -top-2 -right-2.5 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
					aria-label={`${count} productos`}
				>
					{count}
				</span>
			</span>
			<span class="flex-1 text-left font-semibold">Ver mi pedido</span>
			<span
				class="tabular flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 font-bold text-primary-foreground"
			>
				{formatMoney(subtotal)}
				<ArrowRight class="size-4" />
			</span>
		</button>
	{/key}
</div>
