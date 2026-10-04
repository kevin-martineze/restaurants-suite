<script lang="ts">
	import { PRODUCT_NAME } from '$lib/brand';
</script>

<svelte:head>
	<title>{PRODUCT_NAME}</title>
</svelte:head>

<main class="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-3 px-4">
	<h1 class="text-2xl font-semibold">Proyecto en construcción</h1>
	<p class="text-muted-foreground">
		La primera rebanada es la carta web con carrito, con un restaurante de prueba.
	</p>
	<a href="/la-parrilla-de-tono" class="font-medium text-primary underline underline-offset-4">
		Ver la carta de prueba
	</a>
</main>
