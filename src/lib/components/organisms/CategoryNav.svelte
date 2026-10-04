<script lang="ts">
	import type { Category } from '$lib/domain/menu';

	import { cn } from '$lib/utils';

	interface Props {
		categories: Category[];
		activeId: string | null;
		onSelect: (categoryId: string) => void;
	}

	let { categories, activeId, onSelect }: Props = $props();

	let nav = $state<HTMLElement | null>(null);

	// La pestaña activa cambia al hacer scroll por la carta: se trae a la vista
	// dentro de la barra, sin mover la página.
	$effect(() => {
		if (!nav || !activeId) return;

		const pill = nav.querySelector<HTMLElement>(`[data-category="${activeId}"]`);

		if (pill) nav.scrollTo({ left: pill.offsetLeft - 16, behavior: 'smooth' });
	});
</script>

<nav
	bind:this={nav}
	aria-label="Categorías"
	class="sticky top-0 z-20 flex gap-2 overflow-x-auto border-b border-border bg-background/95 px-4 py-3 backdrop-blur scrollbar-none"
>
	{#each categories as category (category.id)}
		<button
			type="button"
			data-category={category.id}
			aria-current={category.id === activeId ? 'true' : undefined}
			class={cn(
				'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
				category.id === activeId
					? 'bg-primary text-primary-foreground'
					: 'bg-secondary text-secondary-foreground hover:bg-accent'
			)}
			onclick={() => onSelect(category.id)}
		>
			{category.name}
		</button>
	{/each}
</nav>
