<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';

	import ImagePlus from '@lucide/svelte/icons/image-plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	import { enhance } from '$app/forms';

	import { Button } from '$lib/components/atoms/button';
	import { cn } from '$lib/utils';

	interface Props {
		label: string;
		currentUrl: string | null;
		hint: string;
		action: string;
		removeAction: string;
		ratio: 'square' | 'wide';
	}

	let { label, currentUrl, hint, action, removeAction, ratio }: Props = $props();

	let input = $state<HTMLInputElement | null>(null);
	let draft = $state<{ url: string; file: File } | null>(null);
	let uploading = $state(false);

	const preview = $derived(draft?.url ?? currentUrl);
	const actionLabel = $derived(`${currentUrl ? 'Cambiar' : 'Subir'} ${label.toLowerCase()}`);

	function pick() {
		input?.click();
	}

	function choose() {
		const file = input?.files?.[0];

		if (!file) return;
		if (draft) URL.revokeObjectURL(draft.url);

		draft = { url: URL.createObjectURL(file), file };
	}

	function cancel() {
		if (draft) URL.revokeObjectURL(draft.url);

		draft = null;
		if (input) input.value = '';
	}

	const track: SubmitFunction = () => {
		uploading = true;

		return async ({ update }) => {
			await update({ reset: true });
			uploading = false;

			if (draft) URL.revokeObjectURL(draft.url);
			draft = null;
		};
	};
</script>

<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
	<div
		class={cn(
			'relative shrink-0 overflow-hidden rounded-2xl bg-muted',
			ratio === 'square' ? 'size-24' : 'aspect-video w-full sm:max-w-72'
		)}
	>
		{#if preview}
			<img src={preview} alt="" class="size-full object-cover" />
		{:else}
			<div class="flex size-full items-center justify-center text-muted-foreground">
				<ImagePlus class="size-7" />
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
		<form method="POST" {action} enctype="multipart/form-data" use:enhance={track}>
			<input
				bind:this={input}
				type="file"
				name="image"
				accept="image/*"
				class="sr-only"
				disabled={uploading}
				onchange={choose}
			/>
			{#if draft}
				<Button type="submit" class="h-10" disabled={uploading}>{actionLabel}</Button>
			{:else}
				<Button type="button" class="h-10" onclick={pick} disabled={uploading}>
					<ImagePlus class="size-4" />
					{actionLabel}
				</Button>
			{/if}
		</form>

		{#if draft}
			<Button
				type="button"
				variant="ghost"
				class="h-8 self-start"
				onclick={cancel}
				disabled={uploading}
			>
				Cancelar
			</Button>
		{/if}

		{#if currentUrl}
			<form method="POST" action={removeAction} use:enhance={track}>
				<button
					type="submit"
					class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"
					disabled={uploading}
				>
					<Trash2 class="size-4" />
					Quitar {label.toLowerCase()}
				</button>
			</form>
		{/if}

		<span class="text-xs text-muted-foreground">{hint}</span>
	</div>
</div>
