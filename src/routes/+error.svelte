<script lang="ts">
	import SearchX from '@lucide/svelte/icons/search-x';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

	import { page } from '$app/state';

	import { PRODUCT_NAME } from '$lib/brand';

	const notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? 'No encontramos esta página' : 'Algo falló'} · {PRODUCT_NAME}</title>
</svelte:head>

<main class="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-6">
	<span
		class="flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground"
	>
		{#if notFound}
			<SearchX class="size-7" />
		{:else}
			<TriangleAlert class="size-7" />
		{/if}
	</span>
	<h1 class="title text-3xl">
		{notFound ? 'No encontramos esta página' : 'Algo falló de nuestro lado'}
	</h1>
	<!-- El mensaje ya viene en español desde el servidor (la API o el load). -->
	<p class="text-lg text-muted-foreground">
		{page.error?.message ?? 'Intenta de nuevo en un momento.'}
	</p>
	<p class="text-sm text-muted-foreground">
		Revisa el enlace que te compartieron o pídele al restaurante uno nuevo.
	</p>
</main>
