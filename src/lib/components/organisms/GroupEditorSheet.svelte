<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { AdminGroup, GroupDraft } from '$lib/domain/menu-admin';

	import { untrack } from 'svelte';

	import Plus from '@lucide/svelte/icons/plus';
	import Trash from '@lucide/svelte/icons/trash-2';
	import X from '@lucide/svelte/icons/x';

	import { enhance } from '$app/forms';

	import { Button } from '$lib/components/atoms/button';
	import * as Drawer from '$lib/components/atoms/drawer';
	import { Input } from '$lib/components/atoms/input';
	import { groupSummary, productsLabel } from '$lib/domain/menu-admin';
	import { formatAmount } from '$lib/utils/money';

	interface Props {
		open: boolean;
		/** `null`: grupo nuevo. */
		group: AdminGroup | null;
		direction: 'bottom' | 'right';
		error: string | null;
	}

	let { open = $bindable(), group, direction, error }: Props = $props();

	// La hoja se monta de nuevo para cada grupo: el borrador parte de él.
	let draft = $state<GroupDraft>(
		untrack(() =>
			group
				? {
						id: group.id,
						name: group.name,
						min: group.min,
						max: group.max,
						modifiers: group.modifiers.map((modifier) => ({ ...modifier }))
					}
				: {
						id: null,
						name: '',
						min: 0,
						max: 1,
						modifiers: [{ id: null, name: '', priceDelta: 0, available: true }]
					}
		)
	);
	let confirmDelete = $state(false);
	let submitting = $state(false);

	const summary = $derived(groupSummary(draft));
	const payload = $derived(JSON.stringify(draft.modifiers));

	function addModifier() {
		draft.modifiers.push({ id: null, name: '', priceDelta: 0, available: true });
	}

	function removeModifier(index: number) {
		draft.modifiers.splice(index, 1);
		draft.max = Math.min(draft.max, Math.max(draft.modifiers.length, 1));
		draft.min = Math.min(draft.min, draft.max);
	}

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
		<form method="POST" action="?/group" class="flex min-h-0 flex-1 flex-col" use:enhance={track}>
			{#if draft.id}<input type="hidden" name="groupId" value={draft.id} />{/if}
			<input type="hidden" name="modifiers" value={payload} />

			<div class="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
				<Drawer.Title class="title text-2xl">
					{draft.id ? 'Editar grupo de opciones' : 'Nuevo grupo de opciones'}
				</Drawer.Title>
				<Drawer.Description class="text-sm text-muted-foreground">
					Lo que el cliente elige al pedir: término, salsas, adiciones…
					{#if group && group.usedBy > 0}
						{group.usedBy === 1 ? 'Lo usa' : 'Lo usan'} {productsLabel(group.usedBy)}.
					{/if}
				</Drawer.Description>

				<label class="flex flex-col gap-1.5">
					<span class="text-sm font-semibold">Nombre</span>
					<Input
						name="name"
						bind:value={draft.name}
						required
						maxlength={80}
						placeholder="Salsas"
						class="h-11"
					/>
				</label>

				<div class="grid grid-cols-2 gap-3">
					<label class="flex flex-col gap-1.5">
						<span class="text-sm font-semibold">Mínimo</span>
						<Input
							name="min"
							type="number"
							min={0}
							max={draft.max}
							bind:value={draft.min}
							class="h-11"
						/>
					</label>
					<label class="flex flex-col gap-1.5">
						<span class="text-sm font-semibold">Máximo</span>
						<Input
							name="max"
							type="number"
							min={1}
							max={draft.modifiers.length}
							bind:value={draft.max}
							class="h-11"
						/>
					</label>
				</div>
				<p class="-mt-3 text-sm text-muted-foreground">
					{summary}. Mínimo 0 es opcional; 1 o más lo vuelve obligatorio.
				</p>

				<fieldset class="flex flex-col gap-2">
					<legend class="mb-2 text-sm font-semibold">Opciones</legend>
					{#each draft.modifiers as modifier, index (index)}
						<div class="flex items-center gap-2">
							<Input
								bind:value={modifier.name}
								placeholder="Tocineta"
								maxlength={80}
								class="h-10 min-w-0 flex-1"
								aria-label={`Nombre de la opción ${index + 1}`}
							/>
							<div class="flex h-10 w-28 items-center rounded-lg border border-input px-2 text-sm">
								<span class="text-muted-foreground">+$</span>
								<input
									inputmode="numeric"
									class="tabular min-w-0 flex-1 bg-transparent pl-1 outline-none"
									aria-label={`Precio extra de la opción ${index + 1}`}
									value={modifier.priceDelta === 0 ? '' : formatAmount(modifier.priceDelta)}
									placeholder="0"
									oninput={(event) => {
										const digits = event.currentTarget.value.replace(/\D/g, '');

										modifier.priceDelta = digits === '' ? 0 : Number(digits);
									}}
								/>
							</div>
							<label class="flex items-center gap-1 text-xs" title="Disponible">
								<input type="checkbox" bind:checked={modifier.available} class="accent-primary" />
								Hay
							</label>
							<button
								type="button"
								class="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-30"
								disabled={draft.modifiers.length === 1}
								aria-label={`Quitar la opción ${index + 1}`}
								onclick={() => removeModifier(index)}
							>
								<X class="size-4" />
							</button>
						</div>
					{/each}
					<Button type="button" variant="outline" class="mt-1 h-10" onclick={addModifier}>
						<Plus class="size-4" /> Agregar opción
					</Button>
				</fieldset>
			</div>

			<div class="flex flex-col gap-3 border-t border-border bg-popover p-5">
				{#if error}
					<p class="rounded-lg bg-destructive/10 p-2 text-sm font-medium text-destructive">
						{error}
					</p>
				{/if}
				<Button type="submit" class="h-12 text-base" disabled={submitting}>
					{submitting ? 'Guardando…' : draft.id ? 'Guardar grupo' : 'Crear grupo'}
				</Button>
			</div>
		</form>

		{#if draft.id}
			<form method="POST" action="?/deleteGroup" class="px-5 pb-5" use:enhance={track}>
				<input type="hidden" name="groupId" value={draft.id} />
				{#if confirmDelete}
					<div class="flex items-center gap-2">
						<span class="flex-1 text-sm">
							¿Borrar el grupo?{group && group.usedBy > 0
								? ` Sale de ${productsLabel(group.usedBy)}.`
								: ''}
						</span>
						<Button type="button" variant="ghost" onclick={() => (confirmDelete = false)}>
							No
						</Button>
						<Button type="submit" variant="destructive" disabled={submitting}>Sí, borrar</Button>
					</div>
				{:else}
					<button
						type="button"
						class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"
						onclick={() => (confirmDelete = true)}
					>
						<Trash class="size-4" /> Borrar grupo
					</button>
				{/if}
			</form>
		{/if}
	</Drawer.Content>
</Drawer.Root>
