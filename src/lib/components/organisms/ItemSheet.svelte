<script lang="ts">
	import type { CartLine } from '$lib/domain/cart';
	import type { Item } from '$lib/domain/menu';

	import { Button } from '$lib/components/atoms/button';
	import * as Drawer from '$lib/components/atoms/drawer';
	import { Textarea } from '$lib/components/atoms/textarea';
	import ItemTagBadge from '$lib/components/molecules/ItemTagBadge.svelte';
	import ModifierGroupField from '$lib/components/molecules/ModifierGroupField.svelte';
	import SuggestionCard from '$lib/components/molecules/SuggestionCard.svelte';
	import QuantityStepper from '$lib/components/molecules/QuantityStepper.svelte';
	import { MAX_NOTE_LENGTH, MAX_QTY_PER_LINE, normalizeNote } from '$lib/domain/cart';
	import {
		selectionLabel,
		selectionProblems,
		toggleModifier,
		unitPrice
	} from '$lib/domain/menu-selection';
	import { formatMoney } from '$lib/utils/money';

	interface Props {
		item: Item;
		open: boolean;
		/** Variables de la plantilla: la hoja se pinta fuera del árbol de la carta. */
		themeStyle: string;
		/** Desde abajo en el celular; desde el costado en pantallas grandes. */
		direction?: 'bottom' | 'right';
		/** "Combina con…": se agregan con un toque, aparte del producto de la hoja. */
		suggestions?: Item[];
		inCart?: (itemId: string) => number;
		onQuickAdd?: (item: Item) => void;
		onAdd: (line: Omit<CartLine, 'key'>) => void;
	}

	let {
		item,
		open = $bindable(),
		themeStyle,
		direction = 'bottom',
		suggestions = [],
		inCart = () => 0,
		onQuickAdd = () => {},
		onAdd
	}: Props = $props();

	// La hoja se monta de nuevo cada vez que se abre (ver la página), así que
	// estos valores siempre arrancan en blanco.
	let selection = $state<string[]>([]);
	let note = $state('');
	let qty = $state(1);

	const problems = $derived(selectionProblems(item, selection));
	const price = $derived(unitPrice(item, selection));

	function add() {
		if (problems.length > 0) return;

		onAdd({
			itemId: item.id,
			modifierIds: selection,
			note: normalizeNote(note),
			qty,
			preview: {
				name: item.name,
				modifiersLabel: selectionLabel(item, selection),
				unitPrice: price,
				imageUrl: item.imageUrl
			}
		});
		open = false;
	}
</script>

<Drawer.Root bind:open {direction} shouldScaleBackground={false}>
	<Drawer.Content style={themeStyle} class={direction === 'bottom' ? 'mx-auto max-w-lg' : ''}>
		<div class="flex min-h-0 flex-1 flex-col overflow-y-auto">
			{#if item.imageUrl}
				<img
					src={item.imageUrl}
					alt=""
					class={direction === 'bottom'
						? 'mx-4 mt-2 aspect-video rounded-2xl object-cover'
						: 'aspect-square w-full object-cover'}
				/>
			{/if}

			<div class="flex flex-col gap-1.5 p-4 text-left">
				{#if item.tags.length > 0}
					<div class="flex flex-wrap gap-1.5">
						{#each item.tags as tag (tag)}
							<ItemTagBadge {tag} />
						{/each}
					</div>
				{/if}
				<Drawer.Title class="font-display text-3xl leading-tight font-extrabold tracking-tight">
					{item.name}
				</Drawer.Title>
				{#if item.description}
					<Drawer.Description>{item.description}</Drawer.Description>
				{/if}
				<p class="tabular pt-1 text-lg font-bold">{formatMoney(item.price)}</p>
			</div>

			<div class="flex flex-col gap-6 px-4 pb-4">
				{#each item.groups as group (group.id)}
					<ModifierGroupField
						{group}
						{selection}
						onToggle={(modifierId) => (selection = toggleModifier(selection, group, modifierId))}
					/>
				{/each}

				<label class="flex flex-col gap-2">
					<span class="font-semibold">
						Notas para la cocina <span class="font-normal text-muted-foreground">(opcional)</span>
					</span>
					<Textarea
						bind:value={note}
						maxlength={MAX_NOTE_LENGTH}
						rows={2}
						placeholder="Ej.: sin cebolla, la salsa aparte"
					/>
				</label>

				{#if suggestions.length > 0}
					<section class="flex flex-col gap-3" aria-labelledby="combina-con">
						<div class="flex items-baseline justify-between">
							<h3 id="combina-con" class="font-display text-lg font-bold">Combina con…</h3>
							<span class="text-xs text-muted-foreground">Se agregan con un toque</span>
						</div>
						<div
							class="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 scrollbar-none"
						>
							{#each suggestions as suggestion (suggestion.id)}
								<SuggestionCard
									item={suggestion}
									inCart={inCart(suggestion.id)}
									onAdd={onQuickAdd}
								/>
							{/each}
						</div>
					</section>
				{/if}
			</div>
		</div>

		<Drawer.Footer class="border-t border-border bg-popover">
			{#if problems[0]}
				<p class="text-sm font-medium text-caution">{problems[0]}</p>
			{/if}
			<div class="flex items-center gap-3">
				<QuantityStepper
					value={qty}
					max={MAX_QTY_PER_LINE}
					label={`Cantidad de ${item.name}`}
					onChange={(value) => (qty = value)}
				/>
				<Button
					type="button"
					class="h-12 flex-1 text-base"
					disabled={problems.length > 0}
					onclick={add}
				>
					Agregar · <span class="tabular">{formatMoney(price * qty)}</span>
				</Button>
			</div>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
