<script lang="ts">
	import type { Item } from '$lib/domain/menu';

	import TrendingUp from '@lucide/svelte/icons/trending-up';

	import FeaturedCard from '$lib/components/molecules/FeaturedCard.svelte';

	interface Props {
		items: Item[];
		inCart: (itemId: string) => number;
		onSelect: (item: Item) => void;
	}

	let { items, inCart, onSelect }: Props = $props();
</script>

<section class="flex flex-col gap-4" aria-labelledby="most-ordered">
	<h2
		id="most-ordered"
		class="flex items-center gap-2 px-4 font-display text-2xl font-extrabold tracking-tight lg:px-0"
	>
		<TrendingUp class="size-6 text-primary" />
		Lo más pedido
	</h2>
	<div
		class="flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 scrollbar-none lg:px-0"
	>
		{#each items as item, index (item.id)}
			<FeaturedCard {item} rank={index + 1} inCart={inCart(item.id)} {onSelect} />
		{/each}
	</div>
</section>
