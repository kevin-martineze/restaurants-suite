<script lang="ts">
	import type { Category } from '$lib/domain/menu';

	import Search from '@lucide/svelte/icons/search';
	import X from '@lucide/svelte/icons/x';

	import { cn } from '$lib/utils';

	interface Props {
		categories: Category[];
		activeId: string | null;
		/** Lo que el cliente está buscando; vive en la URL (`?q=`). */
		query: string;
		onSelect: (categoryId: string) => void;
		onQuery: (query: string) => void;
	}

	let { categories, activeId, query, onSelect, onQuery }: Props = $props();

	let nav = $state<HTMLElement | null>(null);
	let input = $state<HTMLInputElement | null>(null);
	// Abierto si el cliente lo abrió o si ya llegó con una búsqueda en la URL.
	let searchOpen = $state(false);
	const searching = $derived(searchOpen || query !== '');

	// La pestaña activa cambia al hacer scroll por la carta: se trae a la vista
	// dentro de la barra, sin mover la página.
	$effect(() => {
		if (!nav || !activeId || searching) return;

		const pill = nav.querySelector<HTMLElement>(`[data-category="${activeId}"]`);

		if (pill) nav.scrollTo({ left: pill.offsetLeft - 56, behavior: 'smooth' });
	});

	$effect(() => {
		if (searchOpen) input?.focus();
	});

	function closeSearch() {
		searchOpen = false;
		onQuery('');
	}
</script>

<div
	class="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/70"
>
	{#if searching}
		<div class="flex items-center gap-2 px-4 py-2.5 lg:px-0">
			<label class="flex h-11 flex-1 items-center gap-2 rounded-full bg-secondary px-4">
				<Search class="size-4 shrink-0 text-muted-foreground" />
				<span class="sr-only">Buscar en la carta</span>
				<input
					bind:this={input}
					type="search"
					value={query}
					placeholder="Busca un plato, una bebida…"
					autocomplete="off"
					enterkeyhint="search"
					class="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
					oninput={(event) => onQuery(event.currentTarget.value)}
					onkeydown={(event) => {
						if (event.key === 'Escape') closeSearch();
					}}
				/>
			</label>
			<button
				type="button"
				class="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-secondary"
				aria-label="Cerrar la búsqueda"
				onclick={closeSearch}
			>
				<X class="size-5" />
			</button>
		</div>
	{:else}
		<nav
			bind:this={nav}
			aria-label="Categorías"
			class="flex items-center gap-2 overflow-x-auto px-4 py-2.5 scrollbar-none lg:px-0"
		>
			<button
				type="button"
				class="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-accent"
				aria-label="Buscar en la carta"
				onclick={() => (searchOpen = true)}
			>
				<Search class="size-4" />
			</button>
			{#each categories as category (category.id)}
				<button
					type="button"
					data-category={category.id}
					aria-current={category.id === activeId ? 'true' : undefined}
					class={cn(
						'h-10 shrink-0 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-all duration-300',
						category.id === activeId
							? 'bg-foreground text-background shadow-md'
							: 'text-muted-foreground hover:bg-secondary hover:text-foreground'
					)}
					onclick={() => onSelect(category.id)}
				>
					{category.name}
				</button>
			{/each}
		</nav>
	{/if}
</div>
