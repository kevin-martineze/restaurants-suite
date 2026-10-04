<script lang="ts">
	import type { ActionData, PageData } from './$types';

	import ChefHat from '@lucide/svelte/icons/chef-hat';

	import KitchenTicket from '$lib/components/molecules/KitchenTicket.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let now = $state(new Date());

	$effect(() => {
		const timer = setInterval(() => (now = new Date()), 15_000);

		return () => clearInterval(timer);
	});

	const lanes = $derived([
		{
			id: 'to-start',
			title: 'Por empezar',
			orders: data.orders.filter((o) => o.status === 'accepted')
		},
		{
			id: 'in-progress',
			title: 'Preparando',
			orders: data.orders.filter((o) => o.status === 'preparing')
		}
	]);
</script>

<svelte:head>
	<title>Cocina · {data.tenantName}</title>
</svelte:head>

<main class="flex flex-col gap-4 p-4 lg:p-6">
	{#if form?.moveError}
		<p class="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">
			{form.moveError}
		</p>
	{/if}

	{#if data.orders.length === 0}
		<div class="flex flex-col items-center gap-3 py-24 text-center text-muted-foreground">
			<ChefHat class="size-12" />
			<p class="font-display text-2xl font-extrabold text-foreground">Cocina al día</p>
			<p>Cuando caja acepte un pedido, aparece aquí.</p>
		</div>
	{:else}
		<div class="grid gap-6 lg:grid-cols-2">
			{#each lanes as lane (lane.id)}
				<section class="flex flex-col gap-4" aria-labelledby={lane.id}>
					<h2
						id={lane.id}
						class="flex items-center justify-between font-display text-2xl font-extrabold"
					>
						{lane.title}
						<span class="tabular text-base text-muted-foreground">{lane.orders.length}</span>
					</h2>
					<div class="grid gap-4 sm:grid-cols-2">
						{#each lane.orders as order (order.id)}
							<KitchenTicket {order} {now} />
						{/each}
					</div>
				</section>
			{/each}
		</div>
	{/if}
</main>
