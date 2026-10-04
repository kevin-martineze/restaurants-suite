<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import type { StaffOrder } from '$lib/domain/panel';

	import { MediaQuery } from 'svelte/reactivity';

	import Inbox from '@lucide/svelte/icons/inbox';

	import OrderTicket from '$lib/components/molecules/OrderTicket.svelte';
	import OrderDetailSheet from '$lib/components/organisms/OrderDetailSheet.svelte';
	import { BOARD_COLUMNS } from '$lib/domain/panel';
	import { cn } from '$lib/utils';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	const desktop = new MediaQuery('min-width: 1024px');

	// Reloj del tablero: "hace 4 min" avanza sin recargar.
	let now = $state(new Date());

	$effect(() => {
		const timer = setInterval(() => (now = new Date()), 15_000);

		return () => clearInterval(timer);
	});

	const columns = $derived(
		BOARD_COLUMNS.map((column) => ({
			...column,
			orders: data.orders.filter((order) => column.statuses.includes(order.status))
		}))
	);
	const newCount = $derived(columns[0]?.orders.length ?? 0);

	// En el celular se ve una columna a la vez; arranca en la que tiene trabajo.
	let activeColumn = $state('new');

	let detailId = $state<string | null>(null);
	let detailOpen = $state(false);
	// El pedido abierto se busca en los datos frescos: si cambia, la hoja se actualiza.
	const detail = $derived<StaffOrder | null>(
		data.orders.find((order) => order.id === detailId) ?? null
	);
	// El error de la última acción va en la hoja si es del pedido abierto; si no, arriba.
	const failedOrderId = $derived(
		form && 'orderId' in form && typeof form.orderId === 'string' ? form.orderId : null
	);
	const lastMoveError = $derived(form?.moveError ?? null);
	const moveError = $derived(failedOrderId === detailId ? lastMoveError : null);
	const boardError = $derived(failedOrderId !== detailId ? lastMoveError : null);

	function openOrder(order: StaffOrder) {
		detailId = order.id;
		detailOpen = true;
	}

	// Cuando el pedido abierto sale del tablero (entregado, cancelado), la hoja se cierra.
	$effect(() => {
		if (detailOpen && detailId && !detail) detailOpen = false;
	});
</script>

<svelte:head>
	<title>{newCount > 0 ? `(${newCount}) ` : ''}Pedidos · {data.tenantName}</title>
</svelte:head>

<main class="flex flex-col gap-4 p-4 lg:p-6">
	{#if boardError}
		<p class="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">
			{boardError}
		</p>
	{/if}

	<!-- Celular: pestañas por columna, con cuántos pedidos tiene cada una. -->
	<div class="flex gap-2 overflow-x-auto scrollbar-none lg:hidden">
		{#each columns as column (column.id)}
			<button
				type="button"
				class={cn(
					'flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold',
					activeColumn === column.id ? 'bg-foreground text-background' : 'bg-background'
				)}
				onclick={() => (activeColumn = column.id)}
			>
				{column.title}
				<span
					class={cn(
						'tabular flex size-6 items-center justify-center rounded-full text-xs',
						column.id === 'new' && column.orders.length > 0
							? 'bg-primary text-primary-foreground'
							: 'bg-secondary text-foreground'
					)}
				>
					{column.orders.length}
				</span>
			</button>
		{/each}
	</div>

	<div class="grid gap-4 lg:grid-cols-4">
		{#each columns as column (column.id)}
			<section
				class={cn(
					'flex min-w-0 flex-col gap-3',
					!desktop.current && activeColumn !== column.id && 'hidden'
				)}
				aria-labelledby={`column-${column.id}`}
			>
				<h2
					id={`column-${column.id}`}
					class="flex items-center justify-between title text-lg max-lg:hidden"
				>
					{column.title}
					<span class="tabular text-sm font-semibold text-muted-foreground">
						{column.orders.length}
					</span>
				</h2>

				{#each column.orders as order (order.id)}
					<OrderTicket {order} {now} role={data.role} onOpen={openOrder} />
				{:else}
					<div
						class="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground"
					>
						<Inbox class="size-6" />
						{column.id === 'new' ? 'Esperando pedidos…' : 'Nada por aquí'}
					</div>
				{/each}
			</section>
		{/each}
	</div>
</main>

{#if detail}
	<OrderDetailSheet
		order={detail}
		bind:open={detailOpen}
		role={data.role}
		restaurantName={data.tenantName}
		direction={desktop.current ? 'right' : 'bottom'}
		{moveError}
	/>
{/if}
