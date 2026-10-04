<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import type { AdminGroup, AdminItem } from '$lib/domain/menu-admin';

	import { MediaQuery } from 'svelte/reactivity';

	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash from '@lucide/svelte/icons/trash-2';
	import UtensilsCrossed from '@lucide/svelte/icons/utensils-crossed';

	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	import { Button } from '$lib/components/atoms/button';
	import { Input } from '$lib/components/atoms/input';
	import AvailabilityToggle from '$lib/components/molecules/AvailabilityToggle.svelte';
	import ItemTagBadge from '$lib/components/molecules/ItemTagBadge.svelte';
	import GroupEditorSheet from '$lib/components/organisms/GroupEditorSheet.svelte';
	import ItemEditorSheet from '$lib/components/organisms/ItemEditorSheet.svelte';
	import {
		CATEGORY_ROLE_LABEL,
		CATEGORY_ROLES,
		groupSummary,
		productsLabel
	} from '$lib/domain/menu-admin';
	import { cn } from '$lib/utils';
	import { formatMoney } from '$lib/utils/money';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	const desktop = new MediaQuery('min-width: 1024px');
	const direction = $derived(desktop.current ? 'right' : 'bottom');
	const menu = $derived(data.menu);
	// Editar la carta es del dueño y el gerente; el resto solo agota y devuelve.
	const canEdit = $derived(data.role === 'owner' || data.role === 'manager');
	// La vista vive en la URL: se puede compartir y sobrevive a recargar.
	const view = $derived(page.url.searchParams.get('view') === 'groups' ? 'groups' : 'items');
	const error = $derived(form?.menuError ?? null);

	let itemSheet = $state<{ item: AdminItem | null; categoryId: string; version: number } | null>(
		null
	);
	let itemOpen = $state(false);
	let groupSheet = $state<{ group: AdminGroup | null; version: number } | null>(null);
	let groupOpen = $state(false);
	let renaming = $state<string | null>(null);
	let sheetVersion = 0;

	function editItem(item: AdminItem | null, categoryId: string) {
		sheetVersion += 1;
		itemSheet = { item, categoryId, version: sheetVersion };
		itemOpen = true;
	}

	function editGroup(group: AdminGroup | null) {
		sheetVersion += 1;
		groupSheet = { group, version: sheetVersion };
		groupOpen = true;
	}
</script>

<svelte:head>
	<title>Carta · {data.tenantName}</title>
</svelte:head>

<main class="mx-auto flex max-w-5xl flex-col gap-5 p-4 lg:p-6">
	<div class="flex flex-wrap items-end justify-between gap-3">
		<div>
			<h1 class="title text-3xl">Carta</h1>
			<p class="text-sm text-muted-foreground">
				Lo que guardes aquí se ve en la carta de {menu.brand.name} al instante.
				<a href={`/${menu.brand.slug}`} target="_blank" rel="noopener" class="underline">
					Ver la carta
				</a>
			</p>
		</div>
		<nav
			class="flex gap-1 rounded-full bg-background p-1 shadow-sm"
			aria-label="Vistas de la carta"
		>
			<a
				href="?view=items"
				data-sveltekit-replacestate
				aria-current={view === 'items' ? 'page' : undefined}
				class={cn(
					'rounded-full px-4 py-2 text-sm font-semibold',
					view === 'items' ? 'bg-foreground text-background' : 'text-muted-foreground'
				)}
			>
				Productos
			</a>
			<a
				href="?view=groups"
				data-sveltekit-replacestate
				aria-current={view === 'groups' ? 'page' : undefined}
				class={cn(
					'rounded-full px-4 py-2 text-sm font-semibold',
					view === 'groups' ? 'bg-foreground text-background' : 'text-muted-foreground'
				)}
			>
				Grupos de opciones
			</a>
		</nav>
	</div>

	{#if error && !itemOpen && !groupOpen}
		<p class="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">{error}</p>
	{/if}

	{#if view === 'items'}
		{#if canEdit}
			<form
				method="POST"
				action="?/category"
				class="flex flex-wrap gap-2 rounded-2xl bg-background p-3 shadow-sm"
				use:enhance
			>
				<Input
					name="name"
					required
					placeholder="Nueva categoría: Postres"
					class="h-10 min-w-48 flex-1"
				/>
				<select name="role" class="h-10 rounded-lg border border-input bg-background px-3 text-sm">
					{#each CATEGORY_ROLES as role (role)}
						<option value={role}>{CATEGORY_ROLE_LABEL[role]}</option>
					{/each}
				</select>
				<Button type="submit" class="h-10"><Plus class="size-4" /> Agregar categoría</Button>
			</form>
		{/if}

		{#each menu.categories as category, index (category.id)}
			<section
				class={cn(
					'flex flex-col gap-3 rounded-3xl bg-background p-4 shadow-sm',
					!category.active && 'opacity-70'
				)}
				aria-labelledby={`category-${category.id}`}
			>
				<header class="flex flex-wrap items-center gap-2">
					{#if renaming === category.id}
						<form
							method="POST"
							action="?/category"
							class="flex flex-1 flex-wrap gap-2"
							use:enhance={() =>
								async ({ result, update }) => {
									await update();
									if (result.type === 'success') renaming = null;
								}}
						>
							<input type="hidden" name="categoryId" value={category.id} />
							<Input name="name" value={category.name} required class="h-10 min-w-40 flex-1" />
							<select
								name="role"
								value={category.role}
								class="h-10 rounded-lg border border-input bg-background px-3 text-sm"
							>
								{#each CATEGORY_ROLES as role (role)}
									<option value={role}>{CATEGORY_ROLE_LABEL[role]}</option>
								{/each}
							</select>
							<Button type="submit" class="h-10">Guardar</Button>
							<Button type="button" variant="ghost" class="h-10" onclick={() => (renaming = null)}>
								Cancelar
							</Button>
						</form>
					{:else}
						<div class="flex min-w-0 flex-1 flex-col">
							<h2 id={`category-${category.id}`} class="title text-xl">{category.name}</h2>
							<span class="text-xs text-muted-foreground">
								{CATEGORY_ROLE_LABEL[category.role]} · {productsLabel(category.items.length)}
								{#if !category.active}· oculta en la carta{/if}
							</span>
						</div>
						{#if canEdit}
							<div class="flex items-center gap-1">
								<form method="POST" action="?/moveCategory" use:enhance>
									<input type="hidden" name="id" value={category.id} />
									<button
										type="submit"
										name="direction"
										value="up"
										disabled={index === 0}
										aria-label={`Subir ${category.name}`}
										class="flex size-9 items-center justify-center rounded-full hover:bg-secondary disabled:opacity-30"
									>
										<ChevronUp class="size-4" />
									</button>
								</form>
								<form method="POST" action="?/moveCategory" use:enhance>
									<input type="hidden" name="id" value={category.id} />
									<button
										type="submit"
										name="direction"
										value="down"
										disabled={index === menu.categories.length - 1}
										aria-label={`Bajar ${category.name}`}
										class="flex size-9 items-center justify-center rounded-full hover:bg-secondary disabled:opacity-30"
									>
										<ChevronDown class="size-4" />
									</button>
								</form>
								<form method="POST" action="?/toggleCategory" use:enhance>
									<input type="hidden" name="categoryId" value={category.id} />
									<input type="hidden" name="active" value={category.active ? 'false' : 'true'} />
									<button
										type="submit"
										aria-label={category.active
											? `Ocultar ${category.name}`
											: `Mostrar ${category.name}`}
										title={category.active ? 'Ocultar de la carta' : 'Mostrar en la carta'}
										class="flex size-9 items-center justify-center rounded-full hover:bg-secondary"
									>
										{#if category.active}<Eye class="size-4" />{:else}<EyeOff class="size-4" />{/if}
									</button>
								</form>
								<button
									type="button"
									aria-label={`Renombrar ${category.name}`}
									class="flex size-9 items-center justify-center rounded-full hover:bg-secondary"
									onclick={() => (renaming = category.id)}
								>
									<Pencil class="size-4" />
								</button>
								{#if category.items.length === 0}
									<form method="POST" action="?/deleteCategory" use:enhance>
										<input type="hidden" name="categoryId" value={category.id} />
										<button
											type="submit"
											aria-label={`Borrar ${category.name}`}
											class="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
										>
											<Trash class="size-4" />
										</button>
									</form>
								{/if}
							</div>
						{/if}
					{/if}
				</header>

				<ul class="flex flex-col divide-y divide-border">
					{#each category.items as item, itemIndex (item.id)}
						<li class="flex items-center gap-3 py-2.5">
							<div class="size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
								{#if item.imageUrl}
									<img src={item.imageUrl} alt="" loading="lazy" class="size-full object-cover" />
								{:else}
									<div class="flex size-full items-center justify-center text-muted-foreground">
										<UtensilsCrossed class="size-5" />
									</div>
								{/if}
							</div>
							<div class="flex min-w-0 flex-1 flex-col gap-1">
								<span class="flex flex-wrap items-center gap-2">
									<span class="truncate font-semibold">{item.name}</span>
									{#each item.tags as tag (tag)}
										<ItemTagBadge {tag} />
									{/each}
								</span>
								<span class="text-sm text-muted-foreground">
									<span class="tabular font-medium text-foreground">{formatMoney(item.price)}</span>
									{#if item.modifierGroupIds.length > 0}
										· {item.modifierGroupIds.length} grupos de opciones
									{/if}
								</span>
							</div>
							<AvailabilityToggle available={item.available} label={item.name} itemId={item.id} />
							{#if canEdit}
								<div class="flex items-center max-sm:hidden">
									<form method="POST" action="?/moveItem" use:enhance>
										<input type="hidden" name="id" value={item.id} />
										<input type="hidden" name="categoryId" value={category.id} />
										<button
											type="submit"
											name="direction"
											value="up"
											disabled={itemIndex === 0}
											aria-label={`Subir ${item.name}`}
											class="flex size-8 items-center justify-center rounded-full hover:bg-secondary disabled:opacity-30"
										>
											<ChevronUp class="size-4" />
										</button>
									</form>
									<form method="POST" action="?/moveItem" use:enhance>
										<input type="hidden" name="id" value={item.id} />
										<input type="hidden" name="categoryId" value={category.id} />
										<button
											type="submit"
											name="direction"
											value="down"
											disabled={itemIndex === category.items.length - 1}
											aria-label={`Bajar ${item.name}`}
											class="flex size-8 items-center justify-center rounded-full hover:bg-secondary disabled:opacity-30"
										>
											<ChevronDown class="size-4" />
										</button>
									</form>
								</div>
								<Button
									type="button"
									variant="outline"
									class="h-9"
									onclick={() => editItem(item, category.id)}
								>
									<Pencil class="size-4" /><span class="max-sm:sr-only">Editar</span>
								</Button>
							{/if}
						</li>
					{:else}
						<li class="py-3 text-sm text-muted-foreground">Todavía no hay productos aquí.</li>
					{/each}
				</ul>

				{#if canEdit}
					<Button
						type="button"
						variant="ghost"
						class="h-10 self-start"
						onclick={() => editItem(null, category.id)}
					>
						<Plus class="size-4" /> Agregar producto
					</Button>
				{/if}
			</section>
		{:else}
			<p class="rounded-2xl bg-background p-8 text-center text-muted-foreground">
				Empieza creando una categoría, como "Hamburguesas" o "Bebidas".
			</p>
		{/each}
	{:else}
		{#if canEdit}
			<Button type="button" class="h-11 self-start" onclick={() => editGroup(null)}>
				<Plus class="size-4" /> Nuevo grupo de opciones
			</Button>
		{/if}

		<div class="grid gap-4 md:grid-cols-2">
			{#each menu.groups as group (group.id)}
				<section class="flex flex-col gap-3 rounded-3xl bg-background p-4 shadow-sm">
					<header class="flex items-start justify-between gap-2">
						<div>
							<h2 class="title text-lg">{group.name}</h2>
							<span class="text-xs text-muted-foreground">
								{groupSummary(group)} · {group.usedBy === 0
									? 'sin usar'
									: `lo ${group.usedBy === 1 ? 'usa' : 'usan'} ${productsLabel(group.usedBy)}`}
							</span>
						</div>
						{#if canEdit}
							<Button type="button" variant="outline" class="h-9" onclick={() => editGroup(group)}>
								<Pencil class="size-4" /> Editar
							</Button>
						{/if}
					</header>
					<ul class="flex flex-col gap-1.5">
						{#each group.modifiers as modifier (modifier.id)}
							<li class="flex items-center justify-between gap-2 text-sm">
								<span>
									{modifier.name}
									{#if modifier.priceDelta > 0}
										<span class="tabular text-muted-foreground"
											>+{formatMoney(modifier.priceDelta)}</span
										>
									{/if}
								</span>
								<AvailabilityToggle
									size="sm"
									available={modifier.available}
									label={`${group.name}: ${modifier.name}`}
									groupId={group.id}
									modifierId={modifier.id}
								/>
							</li>
						{/each}
					</ul>
				</section>
			{:else}
				<p class="rounded-2xl bg-background p-8 text-center text-muted-foreground md:col-span-2">
					Los grupos de opciones son lo que el cliente elige: término, salsas, adiciones.
				</p>
			{/each}
		</div>
	{/if}
</main>

{#if itemSheet}
	{#key itemSheet.version}
		<ItemEditorSheet
			bind:open={itemOpen}
			item={itemSheet.item}
			categoryId={itemSheet.categoryId}
			categories={menu.categories}
			groups={menu.groups}
			{direction}
			{error}
		/>
	{/key}
{/if}

{#if groupSheet}
	{#key groupSheet.version}
		<GroupEditorSheet bind:open={groupOpen} group={groupSheet.group} {direction} {error} />
	{/key}
{/if}
