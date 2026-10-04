<script lang="ts">
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';

	import { cn } from '$lib/utils';

	interface Props {
		value: number;
		min?: number;
		max?: number;
		/** Qué se está contando, para lectores de pantalla: "Cantidad de Patacón". */
		label: string;
		size?: 'sm' | 'md';
		onChange: (value: number) => void;
	}

	let { value, min = 1, max = 20, label, size = 'md', onChange }: Props = $props();

	const buttonClass = $derived(
		cn(
			'flex items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-accent disabled:opacity-40',
			size === 'sm' ? 'size-8' : 'size-10'
		)
	);
</script>

<div class="flex items-center gap-3" role="group" aria-label={label}>
	<button
		type="button"
		class={buttonClass}
		disabled={value <= min}
		aria-label="Restar uno"
		onclick={() => onChange(value - 1)}
	>
		<Minus class="size-4" />
	</button>
	<span class="tabular min-w-6 text-center font-semibold" aria-live="polite">{value}</span>
	<button
		type="button"
		class={buttonClass}
		disabled={value >= max}
		aria-label="Sumar uno"
		onclick={() => onChange(value + 1)}
	>
		<Plus class="size-4" />
	</button>
</div>
