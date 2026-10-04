<script lang="ts">
	import type { PageData } from './$types';
	import type { Item } from '$lib/domain/menu';

	import { untrack } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';

	import SearchX from '@lucide/svelte/icons/search-x';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import * as Drawer from '$lib/components/atoms/drawer';
	import MenuItemCard from '$lib/components/molecules/MenuItemCard.svelte';
	import CartBar from '$lib/components/organisms/CartBar.svelte';
	import CartPanel from '$lib/components/organisms/CartPanel.svelte';
	import CategoryNav from '$lib/components/organisms/CategoryNav.svelte';
	import FeaturedRail from '$lib/components/organisms/FeaturedRail.svelte';
	import ItemSheet from '$lib/components/organisms/ItemSheet.svelte';
	import MenuHero from '$lib/components/organisms/MenuHero.svelte';
	import { popularItems, searchMenu } from '$lib/domain/menu-search';
	import { cartSuggestions, quickAddLine, suggestionsForItem } from '$lib/domain/suggestions';
	import { themeStyle } from '$lib/domain/theme';
	import { cart } from '$lib/stores/cart.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const menu = $derived(data.menu);
	const style = $derived(themeStyle(menu.restaurant.theme));

	// En pantallas grandes el carrito es una columna fija y las opciones salen
	// desde el costado; en el celular, todo sale desde abajo.
	const desktop = new MediaQuery('min-width: 1024px');

	// La búsqueda vive en la URL (`?q=`): se puede compartir y sobrevive a recargar.
	const query = $derived(page.url.searchParams.get('q') ?? '');
	const categories = $derived(searchMenu(menu.categories, query));
	const popular = $derived(popularItems(menu.categories));

	// Unidades de cada producto en el carrito, sumando todas sus variantes.
	const qtyByItem = $derived(
		cart.lines.reduce(
			(totals, line) => totals.set(line.itemId, (totals.get(line.itemId) ?? 0) + line.qty),
			new Map<string, number>()
		)
	);

	const inCartOf = (itemId: string): number => qtyByItem.get(itemId) ?? 0;

	let activeId = $state<string | null>(untrack(() => data.menu.categories[0]?.id ?? null));

	let sheetItem = $state<Item | null>(null);
	let sheetOpen = $state(false);
	// Cada apertura monta la hoja de nuevo: elecciones, nota y cantidad en blanco.
	let sheetVersion = $state(0);

	// "Combina con…" del producto abierto y "¿Le sumas algo?" del pedido.
	const sheetSuggestions = $derived(
		sheetItem ? suggestionsForItem(menu.categories, sheetItem) : []
	);
	const orderSuggestions = $derived(cartSuggestions(menu.categories, cart.lines));

	$effect(() => {
		cart.hydrate(menu.restaurant.slug);
	});

	// La pestaña activa sigue el scroll: la sección que cruza la franja de
	// arriba, justo debajo de la barra de categorías, es la activa.
	// Se rearma cuando la búsqueda cambia las secciones visibles.
	$effect(() => {
		if (categories.length === 0) return;

		const sections = document.querySelectorAll<HTMLElement>('[data-section]');
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const id = entry.target.getAttribute('data-section');

					if (entry.isIntersecting && id) activeId = id;
				}
			},
			{ rootMargin: '-72px 0px -70% 0px' }
		);

		sections.forEach((section) => observer.observe(section));

		return () => observer.disconnect();
	});

	function goTo(categoryId: string) {
		activeId = categoryId;
		document
			.getElementById(`categoria-${categoryId}`)
			?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function setQuery(value: string) {
		const url = new URL(page.url);

		if (value.trim() === '') url.searchParams.delete('q');
		else url.searchParams.set('q', value);

		void goto(url, { replaceState: true, keepFocus: true, noScroll: true });
	}

	function addToCart(line: Parameters<typeof cart.add>[0]) {
		cart.add(line);
		// Un toque corto en los Android que lo permiten; los demás lo ignoran.
		navigator.vibrate?.(15);
	}

	function quickAdd(item: Item) {
		addToCart(quickAddLine(item));
	}

	function openItem(item: Item) {
		sheetItem = item;
		sheetVersion += 1;
		sheetOpen = true;
	}
</script>

<svelte:head>
	<title>{menu.restaurant.name} · Carta</title>
	{#if menu.restaurant.tagline}
		<meta name="description" content={menu.restaurant.tagline} />
	{/if}
</svelte:head>

<div {style} class="min-h-dvh pb-28 lg:pb-16">
	<div class="mx-auto max-w-7xl lg:px-8">
		<MenuHero {menu} />

		<div class="mt-8 lg:grid lg:grid-cols-3 lg:gap-10">
			<div class="min-w-0 lg:col-span-2">
				{#if popular.length > 0 && query === ''}
					<FeaturedRail items={popular} inCart={inCartOf} onSelect={openItem} />
				{/if}

				<div class="mt-8">
					<CategoryNav {categories} {activeId} {query} onSelect={goTo} onQuery={setQuery} />
				</div>

				<main class="flex flex-col gap-12 px-4 pt-6 lg:px-0">
					{#if query !== '' && categories.length === 0}
						<div class="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
							<SearchX class="size-10" />
							<p class="font-display text-xl font-bold text-foreground">
								No encontramos «{query}»
							</p>
							<p>Prueba con otra palabra o revisa la carta completa.</p>
						</div>
					{/if}
					{#each categories as category (category.id)}
						<section
							id={`categoria-${category.id}`}
							data-section={category.id}
							class="flex scroll-mt-20 flex-col gap-4"
						>
							<h2 class="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
								{category.name}
							</h2>
							<div class="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-5">
								{#each category.items as item (item.id)}
									<MenuItemCard {item} inCart={inCartOf(item.id)} onSelect={openItem} />
								{/each}
							</div>
						</section>
					{/each}
				</main>
			</div>

			<aside class="hidden lg:block">
				<div class="sticky top-0 flex h-dvh flex-col py-6">
					<CartPanel
						class="max-h-full rounded-2xl border border-border bg-card shadow-sm"
						lines={cart.lines}
						previewSubtotal={cart.previewSubtotal}
						status={menu.status}
						checkoutHref={`/${menu.restaurant.slug}/pedido`}
						onQty={(key, qty) => cart.setQty(key, qty)}
						onRemove={(key) => cart.remove(key)}
						suggestions={orderSuggestions}
						inCart={inCartOf}
						onQuickAdd={quickAdd}
					/>
				</div>
			</aside>
		</div>
	</div>
</div>

{#if !cart.isEmpty}
	<div {style} class="lg:hidden">
		<CartBar count={cart.count} subtotal={cart.previewSubtotal} onOpen={() => (cart.open = true)} />
	</div>
{/if}

{#if sheetItem}
	{#key sheetVersion}
		<ItemSheet
			item={sheetItem}
			bind:open={sheetOpen}
			themeStyle={style}
			direction={desktop.current ? 'right' : 'bottom'}
			suggestions={sheetSuggestions}
			inCart={inCartOf}
			onQuickAdd={quickAdd}
			onAdd={addToCart}
		/>
	{/key}
{/if}

{#if !desktop.current}
	<Drawer.Root bind:open={cart.open} shouldScaleBackground={false}>
		<Drawer.Content {style} class="mx-auto max-w-lg">
			<Drawer.Title class="px-4 pt-2 font-display text-2xl font-extrabold tracking-tight">
				Tu pedido
			</Drawer.Title>
			<Drawer.Description class="sr-only"
				>Revisa los productos antes de continuar.</Drawer.Description
			>
			<CartPanel
				class="flex-1"
				showTitle={false}
				lines={cart.lines}
				previewSubtotal={cart.previewSubtotal}
				status={menu.status}
				checkoutHref={`/${menu.restaurant.slug}/pedido`}
				onQty={(key, qty) => cart.setQty(key, qty)}
				onRemove={(key) => cart.remove(key)}
				suggestions={orderSuggestions}
				inCart={inCartOf}
				onQuickAdd={quickAdd}
			/>
		</Drawer.Content>
	</Drawer.Root>
{/if}
