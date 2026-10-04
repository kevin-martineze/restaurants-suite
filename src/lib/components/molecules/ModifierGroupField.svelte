<script lang="ts">
	import type { ModifierGroup } from '$lib/domain/menu';

	import {
		countInGroup,
		groupRuleLabel,
		isRequired,
		isSingleChoice
	} from '$lib/domain/menu-selection';
	import { cn } from '$lib/utils';
	import { formatMoney } from '$lib/utils/money';

	interface Props {
		group: ModifierGroup;
		selection: string[];
		onToggle: (modifierId: string) => void;
	}

	let { group, selection, onToggle }: Props = $props();

	// Radio solo cuando hay que elegir exactamente una: un radio no se puede
	// desmarcar, y en un grupo opcional el cliente tiene que poder arrepentirse.
	const asRadio = $derived(isSingleChoice(group) && isRequired(group));
	const count = $derived(countInGroup(selection, group));
	const missing = $derived(count < group.min);
	const full = $derived(!isSingleChoice(group) && count >= group.max);
</script>

<fieldset class="flex flex-col gap-2">
	<legend class="mb-2 flex w-full items-baseline justify-between gap-2">
		<span class="font-display text-lg font-bold">{group.name}</span>
		<span class={cn('text-xs', missing ? 'font-medium text-caution' : 'text-muted-foreground')}>
			{groupRuleLabel(group)}
			{#if group.max > 1}
				<span class="tabular">· {count}/{group.max}</span>
			{/if}
		</span>
	</legend>

	{#each group.modifiers as modifier (modifier.id)}
		{@const checked = selection.includes(modifier.id)}
		{@const disabled = !modifier.available || (full && !checked)}
		<label
			class={cn(
				'flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border px-3.5 py-2 transition-colors hover:bg-secondary/60',
				checked && 'border-primary bg-primary/5',
				disabled && 'cursor-not-allowed opacity-50'
			)}
		>
			<input
				type={asRadio ? 'radio' : 'checkbox'}
				name={group.id}
				value={modifier.id}
				class="size-4 shrink-0 accent-primary"
				{checked}
				{disabled}
				onchange={() => onToggle(modifier.id)}
			/>
			<span class="flex-1">{modifier.name}</span>
			{#if !modifier.available}
				<span class="text-xs text-muted-foreground">Agotado</span>
			{:else if modifier.priceDelta > 0}
				<span class="tabular text-sm text-muted-foreground"
					>+{formatMoney(modifier.priceDelta)}</span
				>
			{/if}
		</label>
	{/each}
</fieldset>
