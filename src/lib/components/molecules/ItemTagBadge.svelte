<script lang="ts">
	import type { ItemTag } from '$lib/domain/menu';

	import Flame from '@lucide/svelte/icons/flame';
	import Leaf from '@lucide/svelte/icons/leaf';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import TrendingUp from '@lucide/svelte/icons/trending-up';

	import { ITEM_TAG_LABEL } from '$lib/domain/menu';
	import { cn } from '$lib/utils';

	interface Props {
		tag: ItemTag;
		class?: string;
	}

	let { tag, class: className }: Props = $props();

	const ICON = { popular: TrendingUp, new: Sparkles, spicy: Flame, vegetarian: Leaf };
	const Icon = $derived(ICON[tag]);
</script>

<span
	class={cn(
		'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm',
		tag === 'popular' && 'bg-primary text-primary-foreground',
		tag === 'new' && 'bg-background text-foreground',
		tag === 'spicy' && 'bg-destructive text-destructive-foreground',
		tag === 'vegetarian' && 'bg-success text-success-foreground',
		className
	)}
>
	<Icon class="size-3.5" />
	{ITEM_TAG_LABEL[tag]}
</span>
