<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import type { Item } from '$lib/domain/menu';

	import { untrack } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';

	import * as Drawer from '$lib/components/atoms/drawer';
	import MenuItemCard from '$lib/components/molecules/MenuItemCard.svelte';
	import CartBar from '$lib/components/organisms/CartBar.svelte';
	import CartPanel from '$lib/components/organisms/CartPanel.svelte';
	import CategoryNav from '$lib/components/organisms/CategoryNav.svelte';
	import ItemSheet from '$lib/components/organisms/ItemSheet.svelte';
	import MenuHeader from '$lib/components/organisms/MenuHeader.svelte';
	import { themeStyle } from '$lib/domain/theme';
	import { cart } from '$lib/stores/cart.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	const menu = $derived(data.menu);
	const style = $derived(themeStyle(menu.restaurant.theme));

	// En pantallas grandes el carrito es una columna fija y las opciones salen
	// desde el costado; en el celular, todo sale desde abajo.
	const desktop = new MediaQuery('min-width: 1024px');

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

<div {style} class="min-h-dvh pb-28 lg:pb-16">
	<div class="mx-auto max-w-7xl lg:px-8">
		<MenuHeader {menu} />

		<div class="mt-6 lg:grid lg:grid-cols-3 lg:gap-10">
			<div class="min-w-0 lg:col-span-2">
				<CategoryNav categories={menu.categories} {activeId} onSelect={goTo} />

				<main class="flex flex-col gap-10 px-4 pt-6 lg:px-0">
					{#each menu.categories as category (category.id)}
						<section
							id={`categoria-${category.id}`}
							data-section={category.id}
							class="flex scroll-mt-20 flex-col gap-4"
						>
							<h2 class="text-xl font-extrabold tracking-tight sm:text-2xl">{category.name}</h2>
							<div class="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-5">
								{#each category.items as item (item.id)}
									<MenuItemCard {item} onSelect={openItem} />
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
						{cartPayload}
						{quote}
						{quoteError}
						onQty={(key, qty) => cart.setQty(key, qty)}
						onRemove={(key) => cart.remove(key)}
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
			onAdd={(line) => cart.add(line)}
		/>
	{/key}
{/if}

{#if !desktop.current}
	<Drawer.Root bind:open={cart.open} shouldScaleBackground={false}>
		<Drawer.Content {style} class="mx-auto max-w-lg">
			<Drawer.Title class="px-4 pt-2 text-xl font-extrabold tracking-tight">Tu pedido</Drawer.Title>
			<Drawer.Description class="sr-only"
				>Revisa los productos antes de continuar.</Drawer.Description
			>
			<CartPanel
				class="flex-1"
				showTitle={false}
				lines={cart.lines}
				previewSubtotal={cart.previewSubtotal}
				status={menu.status}
				{cartPayload}
				{quote}
				{quoteError}
				onQty={(key, qty) => cart.setQty(key, qty)}
				onRemove={(key) => cart.remove(key)}
			/>
		</Drawer.Content>
	</Drawer.Root>
{/if}
