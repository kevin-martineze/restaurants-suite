<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { AdminCategory, AdminGroup, AdminItem } from '$lib/domain/menu-admin';

	import { untrack } from 'svelte';

	import ImagePlus from '@lucide/svelte/icons/image-plus';
	import Trash from '@lucide/svelte/icons/trash-2';
	import UtensilsCrossed from '@lucide/svelte/icons/utensils-crossed';

	import { enhance } from '$app/forms';

	import { Button } from '$lib/components/atoms/button';
	import * as Drawer from '$lib/components/atoms/drawer';
	import { Input } from '$lib/components/atoms/input';
	import { Textarea } from '$lib/components/atoms/textarea';
	import { ITEM_TAG_LABEL } from '$lib/domain/menu';
	import { groupSummary, ITEM_TAGS } from '$lib/domain/menu-admin';
	import { cn } from '$lib/utils';
	import { formatAmount } from '$lib/utils/money';

	interface Props {
		open: boolean;
		/** `null`: producto nuevo en `categoryId`. */
		item: AdminItem | null;
		categoryId: string;
		categories: AdminCategory[];
		groups: AdminGroup[];
		direction: 'bottom' | 'right';
		error: string | null;
	}

	let {
		open = $bindable(),
		item,
		categoryId,
		categories,
		groups,
		direction,
		error
	}: Props = $props();

	// La hoja se monta de nuevo para cada producto: estos valores parten de él.
	let price = $state(untrack(() => (item ? formatAmount(item.price) : '')));
	let selectedGroups = $state<string[]>(untrack(() => item?.modifierGroupIds ?? []));
	let pairsWith = $state<string[]>(untrack(() => item?.pairsWith ?? []));
	let confirmDelete = $state(false);
	let submitting = $state(false);
	let uploading = $state(false);
	let photoForm = $state<HTMLFormElement | null>(null);

	// "Combina con…": lo que se agrega con un toque desde acompañantes, bebidas y postres.
	const suggestable = $derived(
		categories
			.filter((category) => category.role !== 'main')
			.flatMap((category) => category.items)
			.filter((candidate) => candidate.id !== item?.id)
	);

	function toggle(list: string[], id: string, max = Infinity): string[] {
		if (list.includes(id)) return list.filter((value) => value !== id);

		return list.length >= max ? list : [...list, id];
	}

	// La foto no cierra la hoja: se queda para seguir editando el producto.
	const trackPhoto: SubmitFunction = () => {
		uploading = true;

		return async ({ update }) => {
			await update({ reset: true });
			uploading = false;
		};
	};

	const track: SubmitFunction = () => {
		submitting = true;

		return async ({ result, update }) => {
			await update({ reset: false });
			submitting = false;

			if (result.type === 'success') open = false;
		};
	};
</script>

<Drawer.Root bind:open {direction} shouldScaleBackground={false}>
	<Drawer.Content class={direction === 'right' ? 'sm:max-w-md' : 'mx-auto max-w-lg'}>
		{#if item}
			<div class="flex items-center gap-4 border-b border-border p-5">
				<div class="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-muted">
					{#if item.imageUrl}
						<img src={item.imageUrl} alt="" class="size-full object-cover" />
					{:else}
						<div class="flex size-full items-center justify-center text-muted-foreground">
							<UtensilsCrossed class="size-7" />
						</div>
					{/if}
					{#if uploading}
						<div
							class="absolute inset-0 flex items-center justify-center bg-foreground/50 text-xs font-semibold text-background"
						>
							Subiendo…
						</div>
					{/if}
				</div>
				<div class="flex flex-col gap-2">
					<form
						bind:this={photoForm}
						method="POST"
						action="?/image"
						enctype="multipart/form-data"
						use:enhance={trackPhoto}
					>
						<input type="hidden" name="itemId" value={item.id} />
						<label
							class="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-input px-3 text-sm font-semibold hover:bg-secondary"
						>
							<ImagePlus class="size-4" />
							{item.imageUrl ? 'Cambiar foto' : 'Subir foto'}
							<input
								type="file"
								name="image"
								accept="image/*"
								class="sr-only"
								disabled={uploading}
								onchange={() => photoForm?.requestSubmit()}
							/>
						</label>
					</form>
					{#if item.imageUrl}
						<form method="POST" action="?/removeImage" use:enhance={trackPhoto}>
							<input type="hidden" name="itemId" value={item.id} />
							<button
								type="submit"
								class="text-sm text-muted-foreground hover:text-destructive"
								disabled={uploading}
							>
								Quitar foto
							</button>
						</form>
					{/if}
					<span class="text-xs text-muted-foreground">Cuadrada se ve mejor. Hasta 12 MB.</span>
				</div>
			</div>
		{/if}

		<form method="POST" action="?/item" class="flex min-h-0 flex-1 flex-col" use:enhance={track}>
			{#if item}<input type="hidden" name="itemId" value={item.id} />{/if}

			<div class="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
				<Drawer.Title class="title text-2xl">
					{item ? 'Editar producto' : 'Nuevo producto'}
				</Drawer.Title>
				<Drawer.Description class="sr-only">
					Nombre, precio, opciones y sugerencias del producto.
				</Drawer.Description>

				<label class="flex flex-col gap-1.5">
					<span class="text-sm font-semibold">Nombre</span>
					<Input name="name" value={item?.name ?? ''} required maxlength={120} class="h-11" />
				</label>

				<label class="flex flex-col gap-1.5">
					<span class="text-sm font-semibold">
						Descripción <span class="font-normal text-muted-foreground">(opcional)</span>
					</span>
					<Textarea
						name="description"
						value={item?.description ?? ''}
						rows={3}
						maxlength={500}
						placeholder="Qué trae: carne de 150 g, queso costeño…"
					/>
				</label>

				<div class="grid grid-cols-2 gap-3">
					<label class="flex flex-col gap-1.5">
						<span class="text-sm font-semibold">Precio</span>
						<div class="flex h-11 items-center rounded-lg border border-input px-3">
							<span class="text-muted-foreground">$</span>
							<input
								name="price"
								inputmode="numeric"
								required
								class="tabular min-w-0 flex-1 bg-transparent pl-1 outline-none"
								value={price}
								oninput={(event) => {
									const digits = event.currentTarget.value.replace(/\D/g, '');

									price = digits === '' ? '' : formatAmount(Number(digits));
									event.currentTarget.value = price;
								}}
							/>
						</div>
					</label>
					<label class="flex flex-col gap-1.5">
						<span class="text-sm font-semibold">Categoría</span>
						<select
							name="categoryId"
							class="h-11 rounded-lg border border-input bg-background px-3"
							value={item?.categoryId ?? categoryId}
						>
							{#each categories as category (category.id)}
								<option value={category.id}>{category.name}</option>
							{/each}
						</select>
					</label>
				</div>

				<fieldset class="flex flex-col gap-2">
					<legend class="mb-2 text-sm font-semibold">Etiquetas</legend>
					<div class="flex flex-wrap gap-2">
						{#each ITEM_TAGS as tag (tag)}
							<label
								class="flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm has-checked:border-primary has-checked:bg-primary/10"
							>
								<input
									type="checkbox"
									name="tags"
									value={tag}
									checked={item?.tags.includes(tag) ?? false}
									class="accent-primary"
								/>
								{ITEM_TAG_LABEL[tag]}
							</label>
						{/each}
					</div>
					<p class="text-xs text-muted-foreground">
						"Más pedido" lo pone en el carrusel de arriba de la carta.
					</p>
				</fieldset>

				<fieldset class="flex flex-col gap-2">
					<legend class="mb-2 text-sm font-semibold">Opciones que se eligen</legend>
					{#if groups.length === 0}
						<p class="text-sm text-muted-foreground">
							Todavía no hay grupos de opciones. Créalos en la pestaña "Grupos de opciones".
						</p>
					{/if}
					{#each groups as group (group.id)}
						<label
							class={cn(
								'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2',
								selectedGroups.includes(group.id) ? 'border-primary bg-primary/5' : 'border-border'
							)}
						>
							<input
								type="checkbox"
								name="modifierGroupIds"
								value={group.id}
								checked={selectedGroups.includes(group.id)}
								onchange={() => (selectedGroups = toggle(selectedGroups, group.id))}
								class="accent-primary"
							/>
							<span class="flex-1">
								<span class="font-medium">{group.name}</span>
								<span class="block text-xs text-muted-foreground">
									{groupSummary(group)} · {group.modifiers.map((m) => m.name).join(', ')}
								</span>
							</span>
						</label>
					{/each}
				</fieldset>

				{#if suggestable.length > 0}
					<fieldset class="flex flex-col gap-2">
						<legend class="mb-1 text-sm font-semibold">
							Combina con… <span class="font-normal text-muted-foreground">(hasta 3)</span>
						</legend>
						<p class="text-xs text-muted-foreground">
							Si no eliges, la carta sugiere sola acompañantes y bebidas.
						</p>
						<div class="flex flex-wrap gap-2">
							{#each suggestable as candidate (candidate.id)}
								<label
									class={cn(
										'flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm',
										pairsWith.includes(candidate.id)
											? 'border-primary bg-primary/10'
											: 'border-border',
										!pairsWith.includes(candidate.id) && pairsWith.length >= 3 && 'opacity-50'
									)}
								>
									<input
										type="checkbox"
										name="pairsWith"
										value={candidate.id}
										checked={pairsWith.includes(candidate.id)}
										disabled={!pairsWith.includes(candidate.id) && pairsWith.length >= 3}
										onchange={() => (pairsWith = toggle(pairsWith, candidate.id, 3))}
										class="accent-primary"
									/>
									{candidate.name}
								</label>
							{/each}
						</div>
					</fieldset>
				{/if}
			</div>

			<div class="flex flex-col gap-3 border-t border-border bg-popover p-5">
				{#if error}
					<p class="rounded-lg bg-destructive/10 p-2 text-sm font-medium text-destructive">
						{error}
					</p>
				{/if}
				<Button type="submit" class="h-12 text-base" disabled={submitting}>
					{submitting ? 'Guardando…' : item ? 'Guardar cambios' : 'Agregar a la carta'}
				</Button>
			</div>
		</form>

		{#if item}
			<form
				method="POST"
				action="?/deleteItem"
				class="border-t border-border px-5 pb-5"
				use:enhance={track}
			>
				<input type="hidden" name="itemId" value={item.id} />
				{#if confirmDelete}
					<div class="flex items-center gap-2 pt-3">
						<span class="flex-1 text-sm">¿Borrar «{item.name}» de la carta?</span>
						<Button type="button" variant="ghost" onclick={() => (confirmDelete = false)}>
							No
						</Button>
						<Button type="submit" variant="destructive" disabled={submitting}>Sí, borrar</Button>
					</div>
				{:else}
					<button
						type="button"
						class="flex items-center gap-1.5 pt-3 text-sm text-muted-foreground hover:text-destructive"
						onclick={() => (confirmDelete = true)}
					>
						<Trash class="size-4" /> Borrar producto
					</button>
				{/if}
			</form>
		{/if}
	</Drawer.Content>
</Drawer.Root>
