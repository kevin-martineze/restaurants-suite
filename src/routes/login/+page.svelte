<script lang="ts">
	import type { ActionData } from './$types';

	import ChefHat from '@lucide/svelte/icons/chef-hat';

	import { dev } from '$app/environment';
	import { enhance } from '$app/forms';

	import { Button } from '$lib/components/atoms/button';
	import { Input } from '$lib/components/atoms/input';
	import { PRODUCT_NAME } from '$lib/brand';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();

	let submitting = $state(false);

	// Solo en desarrollo: las cuentas de la semilla de la API.
	const DEMO_ACCOUNTS = [
		{ email: 'caja@laparrilla.test', role: 'Caja' },
		{ email: 'cocina@laparrilla.test', role: 'Cocina' },
		{ email: 'dueno@laparrilla.test', role: 'Dueño' }
	];
</script>

<svelte:head>
	<title>Entrar · {PRODUCT_NAME}</title>
</svelte:head>

<main class="flex min-h-dvh items-center justify-center bg-secondary/40 px-4 py-10">
	<div class="flex w-full max-w-sm flex-col gap-6">
		<div class="flex flex-col items-center gap-3 text-center">
			<span
				class="flex size-14 items-center justify-center rounded-2xl bg-foreground text-background"
			>
				<ChefHat class="size-7" />
			</span>
			<h1 class="title text-3xl">Panel del restaurante</h1>
			<p class="text-muted-foreground">Entra para ver y mover los pedidos.</p>
		</div>

		<form
			method="POST"
			class="flex flex-col gap-4 rounded-3xl bg-background p-6 shadow-sm"
			use:enhance={() => {
				submitting = true;

				return async ({ update }) => {
					await update({ reset: false });
					submitting = false;
				};
			}}
		>
			<label class="flex flex-col gap-1.5">
				<span class="text-sm font-semibold">Correo</span>
				<Input
					name="email"
					type="email"
					autocomplete="username"
					required
					value={form?.email ?? ''}
					class="h-12 text-base"
				/>
			</label>
			<label class="flex flex-col gap-1.5">
				<span class="text-sm font-semibold">Contraseña</span>
				<Input
					name="password"
					type="password"
					autocomplete="current-password"
					required
					class="h-12 text-base"
				/>
			</label>

			{#if form?.message}
				<p class="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">
					{form.message}
				</p>
			{/if}

			<Button type="submit" class="h-12 text-base" disabled={submitting}>
				{submitting ? 'Entrando…' : 'Entrar'}
			</Button>
		</form>

		{#if dev}
			<div class="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
				<p class="font-semibold text-foreground">Cuentas de la demostración</p>
				<p>Contraseña: <code>demo-parrilla-2026</code></p>
				<ul class="mt-1">
					{#each DEMO_ACCOUNTS as account (account.email)}
						<li><code>{account.email}</code> · {account.role}</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</main>
