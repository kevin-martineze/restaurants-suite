<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { ActionData, PageData } from './$types';

	import { untrack } from 'svelte';

	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import Plus from '@lucide/svelte/icons/plus';

	import { enhance } from '$app/forms';

	import { Button } from '$lib/components/atoms/button';
	import { Input } from '$lib/components/atoms/input';
	import BrandImageField from '$lib/components/molecules/BrandImageField.svelte';
	import { isSafeColor, primaryForeground, themeStyle } from '$lib/domain/theme';
	import { cn } from '$lib/utils';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	const error = $derived(form?.brandError ?? null);

	const SUGGESTED_COLORS: readonly string[] = [
		'#c0392b',
		'#e67e22',
		'#d4a017',
		'#16a34a',
		'#0e7490',
		'#1d4ed8',
		'#7c3aed',
		'#18181b'
	];

	let draftPrimary = $state(untrack(() => data.settings.theme.primary));
	let submitting = $state(false);
	let saved = $state(false);
	let copied = $state(false);

	const previewStyle = $derived(
		themeStyle({ primary: draftPrimary, primaryForeground: primaryForeground(draftPrimary) })
	);

	const initials = $derived(
		data.settings.name
			.split(/\s+/)
			.filter((word) => word.length > 2)
			.slice(0, 2)
			.map((word) => word.charAt(0).toUpperCase())
			.join('')
	);

	const trackSave: SubmitFunction = () => {
		submitting = true;
		saved = false;

		return async ({ result, update }) => {
			await update({ reset: false });
			submitting = false;
			if (result.type === 'success') saved = true;
		};
	};

	async function copySlug() {
		try {
			await navigator.clipboard.writeText(`${window.location.origin}/${data.settings.slug}`);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// Sin clipboard (HTTP local o permisos denegados): no pasa nada.
		}
	}
</script>

<svelte:head>
	<title>Marca · {data.tenantName}</title>
</svelte:head>

<main class="mx-auto flex max-w-3xl flex-col gap-5 p-4 lg:p-6">
	<div>
		<h1 class="title text-3xl">Marca</h1>
		<p class="text-sm text-muted-foreground">
			El nombre, el lema, el color, el logo y la portada que el cliente ve en la carta.
		</p>
	</div>

	<section
		class="flex flex-col gap-3 rounded-3xl bg-background p-4 shadow-sm"
		aria-labelledby="slug"
	>
		<h2 id="slug" class="title text-xl">Enlace de la carta</h2>
		<p class="text-sm text-muted-foreground">
			Es la dirección que imprimes en los QR. No se cambia desde aquí.
		</p>
		<div class="mt-1 flex items-center gap-2">
			<a
				href={`/${data.settings.slug}`}
				target="_blank"
				rel="noopener"
				class="flex-1 truncate rounded-lg border border-input px-3 py-2 text-sm font-semibold hover:bg-secondary"
			>
				/{data.settings.slug}
			</a>
			<Button type="button" variant="outline" class="h-10" onclick={copySlug}>
				{#if copied}
					<Check class="size-4" />
					Copiado
				{:else}
					<Copy class="size-4" />
					Copiar
				{/if}
			</Button>
		</div>
	</section>

	<form method="POST" action="?/save" class="flex flex-col gap-5" use:enhance={trackSave}>
		<section
			class="flex flex-col gap-3 rounded-3xl bg-background p-4 shadow-sm"
			aria-labelledby="datos"
		>
			<h2 id="datos" class="title text-xl">Datos</h2>
			<label class="flex flex-col gap-1.5">
				<span class="text-sm font-semibold">Nombre de la marca</span>
				<Input name="name" value={data.settings.name} required maxlength={120} class="h-11" />
			</label>
			<label class="flex flex-col gap-1.5">
				<span class="text-sm font-semibold">
					Lema <span class="font-normal text-muted-foreground">(opcional)</span>
				</span>
				<Input
					name="tagline"
					value={data.settings.tagline ?? ''}
					maxlength={160}
					placeholder="Asados al carbón y comida rápida"
					class="h-11"
				/>
			</label>
		</section>

		<section
			class="flex flex-col gap-3 rounded-3xl bg-background p-4 shadow-sm"
			aria-labelledby="color"
		>
			<h2 id="color" class="title text-xl">Color</h2>
			<p class="text-sm text-muted-foreground">
				El color principal de la carta: botones y lo que se destaca.
			</p>

			<div class="flex items-center gap-3">
				<label
					class="relative size-12 cursor-pointer overflow-hidden rounded-full border border-input"
					style={isSafeColor(draftPrimary) ? `background-color: ${draftPrimary}` : undefined}
					title="Elegir color"
				>
					<input type="color" name="primary" bind:value={draftPrimary} class="sr-only" />
				</label>
				<div class="flex flex-wrap gap-2">
					{#each SUGGESTED_COLORS as color (color)}
						<button
							type="button"
							aria-label={`Usar el color ${color}`}
							class={cn(
								'size-9 rounded-full border-2 transition-transform',
								draftPrimary === color
									? 'scale-110 border-foreground'
									: 'border-transparent hover:scale-105'
							)}
							style={`background-color: ${color}`}
							onclick={() => (draftPrimary = color)}
						></button>
					{/each}
				</div>
			</div>

			<div class="overflow-hidden rounded-3xl bg-foreground p-4" style={previewStyle}>
				<div class="flex items-center gap-3">
					{#if data.settings.logoUrl}
						<img
							src={data.settings.logoUrl}
							alt=""
							class="size-10 shrink-0 rounded-xl bg-background object-cover"
						/>
					{:else}
						<div
							class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary title text-lg text-primary-foreground"
							aria-hidden="true"
						>
							{initials}
						</div>
					{/if}
					<div class="min-w-0">
						<p class="truncate title text-base text-background">{data.settings.name}</p>
						{#if data.settings.tagline}
							<p class="truncate text-xs text-background/80">{data.settings.tagline}</p>
						{/if}
					</div>
				</div>

				<div class="mt-3 flex items-center gap-2">
					<span
						class="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
					>
						Categoría
					</span>
					<span
						class="ml-auto flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow"
						aria-hidden="true"
					>
						<Plus class="size-5" />
					</span>
				</div>
			</div>
		</section>

		{#if error}
			<p class="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">{error}</p>
		{/if}

		{#if saved}
			<p class="rounded-xl bg-success/10 p-3 text-sm font-medium text-success">Marca guardada.</p>
		{/if}

		<Button type="submit" class="h-12 text-base" disabled={submitting}>
			{submitting ? 'Guardando…' : 'Guardar marca'}
		</Button>
	</form>

	<section
		class="flex flex-col gap-3 rounded-3xl bg-background p-4 shadow-sm"
		aria-labelledby="logo"
	>
		<h2 id="logo" class="title text-xl">Logo</h2>
		<BrandImageField
			label="Logo"
			currentUrl={data.settings.logoUrl}
			hint="Cuadrada se ve mejor. Hasta 12 MB."
			action="?/logo"
			removeAction="?/removeLogo"
			ratio="square"
		/>
	</section>

	<section
		class="flex flex-col gap-3 rounded-3xl bg-background p-4 shadow-sm"
		aria-labelledby="portada"
	>
		<h2 id="portada" class="title text-xl">Portada</h2>
		<BrandImageField
			label="Portada"
			currentUrl={data.settings.coverUrl}
			hint="Ancha se ve mejor. Hasta 12 MB."
			action="?/cover"
			removeAction="?/removeCover"
			ratio="wide"
		/>
	</section>
</main>
