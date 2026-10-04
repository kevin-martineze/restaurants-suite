<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import type { Item } from '$lib/domain/menu';

	import { untrack } from 'svelte';

	import CartBar from '$lib/components/organisms/CartBar.svelte';
	import CartSheet from '$lib/components/organisms/CartSheet.svelte';
	import CategoryNav from '$lib/components/organisms/CategoryNav.svelte';
	import ItemSheet from '$lib/components/organisms/ItemSheet.svelte';
	import MenuHeader from '$lib/components/organisms/MenuHeader.svelte';
	import MenuItemCard from '$lib/components/molecules/MenuItemCard.svelte';
	import { themeStyle } from '$lib/domain/theme';
	import { cart } from '$lib/stores/cart.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	const menu = $derived(data.menu);
	const style = $derived(themeStyle(menu.restaurant.theme));

	let activeId = $state<string | null>(untrack(() => data.menu.categories[0]?.id ?? null));

	let sheetItem = $state<Item | null>(null);
	let sheetOpen = $state(false);
	// Cada apertura monta la hoja de nuevo: elecciones, nota y cantidad en blanco.
	let sheetVersion = $state(0);

	const cartPayload = $derived(cart.serialize());
	// La cotización vale solo para el carrito que se cotizó. Si el cliente
	// cambió algo después, se descarta y se vuelve a pedir al continuar.
	const fresh = $derived(form?.quotedCart === cartPayload);
	const quote = $derived(fresh ? (form?.quote ?? null) : null);
	const quoteError = $derived(fresh ? (form?.quoteError ?? null) : null);

	$effect(() => {
		cart.hydrate(menu.restaurant.slug);
	});

	// La pestaña activa sigue el scroll: la sección que cruza la franja de
	// arriba, justo debajo de la barra de categorías, es la activa.
	$effect(() => {
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

<div {style} class="mx-auto min-h-dvh max-w-lg pb-28">
	<MenuHeader {menu} />

	<CategoryNav categories={menu.categories} {activeId} onSelect={goTo} />

	<main class="flex flex-col gap-8 px-4 pt-4">
		{#each menu.categories as category (category.id)}
			<section
				id={`categoria-${category.id}`}
				data-section={category.id}
				class="flex scroll-mt-16 flex-col gap-3"
			>
				<h2 class="text-lg font-bold">{category.name}</h2>
				{#each category.items as item (item.id)}
					<MenuItemCard {item} onSelect={openItem} />
				{/each}
			</section>
		{/each}
	</main>
</div>

{#if !cart.isEmpty}
	<div {style}>
		<CartBar count={cart.count} subtotal={cart.previewSubtotal} onOpen={() => (cart.open = true)} />
	</div>
{/if}

{#if sheetItem}
	{#key sheetVersion}
		<ItemSheet
			item={sheetItem}
			bind:open={sheetOpen}
			themeStyle={style}
			onAdd={(line) => cart.add(line)}
		/>
	{/key}
{/if}

<CartSheet
	bind:open={cart.open}
	themeStyle={style}
	lines={cart.lines}
	previewSubtotal={cart.previewSubtotal}
	status={menu.status}
	{cartPayload}
	{quote}
	{quoteError}
	onQty={(key, qty) => cart.setQty(key, qty)}
	onRemove={(key) => cart.remove(key)}
/>
