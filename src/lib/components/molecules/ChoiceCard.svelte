<script lang="ts">
	import type { Component } from 'svelte';

	import { cn } from '$lib/utils';

	interface Props {
		name: string;
		value: string;
		checked: boolean;
		title: string;
		hint?: string;
		icon: Component<{ class?: string }>;
		disabled?: boolean;
		onSelect: (value: string) => void;
	}

	let {
		name,
		value,
		checked,
		title,
		hint,
		icon: Icon,
		disabled = false,
		onSelect
	}: Props = $props();
</script>

<label
	class={cn(
		'flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-colors',
		checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/60',
		disabled && 'cursor-not-allowed opacity-50'
	)}
>
	<input
		type="radio"
		{name}
		{value}
		{checked}
		{disabled}
		class="sr-only"
		onchange={() => onSelect(value)}
	/>
	<span
		class={cn(
			'flex size-10 shrink-0 items-center justify-center rounded-xl',
			checked ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
		)}
	>
		<Icon class="size-5" />
	</span>
	<span class="flex flex-col">
		<span class="font-semibold">{title}</span>
		{#if hint}
			<span class="text-sm text-muted-foreground">{hint}</span>
		{/if}
	</span>
</label>
