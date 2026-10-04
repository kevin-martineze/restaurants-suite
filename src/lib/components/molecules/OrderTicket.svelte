<script lang="ts">
	import type { StaffOrder } from '$lib/domain/panel';
	import type { Role } from '$lib/domain/staff';

	import Bike from '@lucide/svelte/icons/bike';
	import MessageSquareText from '@lucide/svelte/icons/message-square-text';
	import Store from '@lucide/svelte/icons/store';

	import { enhance } from '$app/forms';

	import { Button } from '$lib/components/atoms/button';
	import { ORDER_STATUS_LABEL } from '$lib/domain/checkout';
	import {
		ACCEPT_ALERT_MINUTES,
		elapsedLabel,
		minutesSince,
		primaryAction
	} from '$lib/domain/panel';
	import { canMoveTo } from '$lib/domain/staff';
	import { cn } from '$lib/utils';
	import { formatMoney } from '$lib/utils/money';

	interface Props {
		order: StaffOrder;
		/** Reloj del tablero: se actualiza solo para que "hace 4 min" avance. */
		now: Date;
		role: Role;
		onOpen: (order: StaffOrder) => void;
	}

	let { order, now, role, onOpen }: Props = $props();

	let submitting = $state(false);

	const minutes = $derived(minutesSince(order.createdAt, now));
	const waitingTooLong = $derived(order.status === 'received' && minutes >= ACCEPT_ALERT_MINUTES);
	const action = $derived(primaryAction(order));
	const canAct = $derived(action !== null && canMoveTo(role, action.to));
</script>

<article
	class={cn(
		'flex flex-col gap-3 rounded-2xl border-2 bg-background p-4 shadow-sm transition-colors',
		order.status === 'received' ? 'border-primary' : 'border-transparent',
		waitingTooLong && 'border-caution bg-caution/5'
	)}
>
	<header class="flex items-start justify-between gap-2">
		<button
			type="button"
			class="flex flex-col text-left"
			onclick={() => onOpen(order)}
			aria-label={`Ver el pedido ${order.number}`}
		>
			<span class="font-display text-2xl leading-none font-extrabold">#{order.number}</span>
			<span class="mt-1 text-sm font-medium">{order.customer.name}</span>
		</button>
		<div class="flex flex-col items-end gap-1">
			<span
				class={cn(
					'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
					order.fulfillment === 'delivery' ? 'bg-secondary' : 'bg-accent'
				)}
			>
				{#if order.fulfillment === 'delivery'}
					<Bike class="size-3.5" /> Domicilio
				{:else}
					<Store class="size-3.5" /> Recoger
				{/if}
			</span>
			<span
				class={cn(
					'tabular text-xs',
					waitingTooLong ? 'font-bold text-caution' : 'text-muted-foreground'
				)}
			>
				{elapsedLabel(minutes)}
			</span>
		</div>
	</header>

	{#if waitingTooLong}
		<p class="text-sm font-semibold text-caution">Lleva {minutes} min sin aceptar</p>
	{/if}

	<ul class="flex flex-col gap-1 text-sm">
		{#each order.items as item, index (index)}
			<li>
				<span class="font-semibold"><span class="tabular">{item.qty}×</span> {item.name}</span>
				{#if item.modifiers.length > 0}
					<span class="block text-muted-foreground">
						{item.modifiers.map((modifier) => modifier.name).join(' · ')}
					</span>
				{/if}
				{#if item.note}
					<span class="block font-medium text-caution">«{item.note}»</span>
				{/if}
			</li>
		{/each}
	</ul>

	{#if order.notes}
		<p class="flex items-start gap-1.5 rounded-lg bg-caution/10 p-2 text-sm text-caution">
			<MessageSquareText class="mt-0.5 size-4 shrink-0" />
			{order.notes}
		</p>
	{/if}

	<footer class="flex items-center justify-between gap-2 border-t border-border pt-3 text-sm">
		<span class="tabular font-bold">{formatMoney(order.totals.total)}</span>
		<span class="text-right text-muted-foreground">
			{#if order.payment.method === 'cash'}
				Efectivo{order.payment.change > 0
					? ` · cambio ${formatMoney(order.payment.change)}`
					: ' exacto'}
			{:else}
				Datáfono
			{/if}
		</span>
	</footer>

	{#if canAct && action}
		<form
			method="POST"
			action="?/move"
			use:enhance={() => {
				submitting = true;

				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<input type="hidden" name="orderId" value={order.id} />
			<input type="hidden" name="to" value={action.to} />
			<Button type="submit" class="h-11 w-full text-base" disabled={submitting}>
				{submitting ? 'Guardando…' : action.label}
			</Button>
		</form>
	{:else}
		<p class="text-center text-xs text-muted-foreground">{ORDER_STATUS_LABEL[order.status]}</p>
	{/if}
</article>
