<script lang="ts">
	import { enhance } from '$app/forms';

	import { cn } from '$lib/utils';

	interface Props {
		available: boolean;
		/** Qué se agota, para lectores de pantalla: "Patacón". */
		label: string;
		itemId?: string;
		groupId?: string;
		modifierId?: string;
		size?: 'sm' | 'md';
	}

	let { available, label, itemId, groupId, modifierId, size = 'md' }: Props = $props();

	let submitting = $state(false);
</script>

<form
	method="POST"
	action="?/availability"
	use:enhance={() => {
		submitting = true;

		return async ({ update }) => {
			await update({ reset: false });
			submitting = false;
		};
	}}
>
	{#if itemId}<input type="hidden" name="itemId" value={itemId} />{/if}
	{#if groupId}<input type="hidden" name="groupId" value={groupId} />{/if}
	{#if modifierId}<input type="hidden" name="modifierId" value={modifierId} />{/if}
	<input type="hidden" name="available" value={available ? 'false' : 'true'} />
	<button
		type="submit"
		role="switch"
		aria-checked={available}
		aria-label={`${label}: ${available ? 'disponible' : 'agotado'}`}
		disabled={submitting}
		class={cn(
			'flex items-center gap-2 rounded-full font-semibold transition-colors disabled:opacity-60',
			size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-9 px-3 text-sm',
			available ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
		)}
	>
		<span
			class={cn(
				'relative inline-flex shrink-0 rounded-full transition-colors',
				size === 'sm' ? 'h-3.5 w-6' : 'h-4 w-7',
				available ? 'bg-success' : 'bg-destructive/40'
			)}
			aria-hidden="true"
		>
			<span
				class={cn(
					'absolute top-0.5 rounded-full bg-background transition-all',
					size === 'sm' ? 'size-2.5' : 'size-3',
					available ? (size === 'sm' ? 'left-3' : 'left-3.5') : 'left-0.5'
				)}
			></span>
		</span>
		{available ? 'Disponible' : 'Agotado'}
	</button>
</form>
