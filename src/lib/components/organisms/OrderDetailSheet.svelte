<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { CancelReason, StaffOrder } from '$lib/domain/panel';
	import type { Role } from '$lib/domain/staff';

	import MapPin from '@lucide/svelte/icons/map-pin';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Navigation from '@lucide/svelte/icons/navigation';
	import Phone from '@lucide/svelte/icons/phone';

	import { enhance } from '$app/forms';

	import { Button } from '$lib/components/atoms/button';
	import * as Drawer from '$lib/components/atoms/drawer';
	import { Separator } from '$lib/components/atoms/separator';
	import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from '$lib/domain/checkout';
	import {
		CANCEL_REASON_LABEL,
		CANCEL_REASONS,
		mapsLinks,
		primaryAction,
		whatsappLink
	} from '$lib/domain/panel';
	import { actorLabel, canMoveTo } from '$lib/domain/staff';
	import { formatMoney } from '$lib/utils/money';

	interface Props {
		order: StaffOrder;
		open: boolean;
		role: Role;
		restaurantName: string;
		direction: 'bottom' | 'right';
		/** El error de la última acción sobre este pedido, si lo hubo. */
		moveError: string | null;
	}

	let { order, open = $bindable(), role, restaurantName, direction, moveError }: Props = $props();

	let submitting = $state(false);
	let reason = $state<CancelReason>('customer');

	const action = $derived(primaryAction(order));
	// Se puede cancelar mientras el pedido no haya salido.
	const cancellable = $derived(
		['received', 'accepted', 'preparing', 'ready'].includes(order.status) &&
			canMoveTo(role, 'cancelled')
	);
	const time = new Intl.DateTimeFormat('es-CO', {
		hour: 'numeric',
		minute: '2-digit',
		timeZone: 'America/Bogota'
	});
	const maps = $derived(order.address ? mapsLinks(order.address.lat, order.address.lng) : null);
	const greeting = $derived(
		`Hola ${order.customer.name.split(' ')[0]}, te escribimos de ${restaurantName} por tu pedido #${order.number}.`
	);

	const track: SubmitFunction = () => {
		submitting = true;

		return async ({ update }) => {
			await update();
			submitting = false;
		};
	};
</script>

<Drawer.Root bind:open {direction} shouldScaleBackground={false}>
	<Drawer.Content class={direction === 'right' ? 'sm:max-w-md' : 'mx-auto max-w-lg'}>
		<div class="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
			<div class="flex items-start justify-between gap-3">
				<div>
					<Drawer.Title class="font-display text-3xl font-extrabold">#{order.number}</Drawer.Title>
					<Drawer.Description>
						{ORDER_STATUS_LABEL[order.status]} · {order.fulfillment === 'delivery'
							? 'Domicilio'
							: 'Recoger en el local'}
					</Drawer.Description>
				</div>
				<span class="tabular font-display text-2xl font-extrabold">
					{formatMoney(order.totals.total)}
				</span>
			</div>

			<section class="flex flex-col gap-2">
				<h3 class="text-sm font-semibold text-muted-foreground">Cliente</h3>
				<p class="text-lg font-semibold">{order.customer.name}</p>
				<div class="flex flex-wrap gap-2">
					<Button href={`tel:${order.customer.phone}`} variant="outline" class="h-10">
						<Phone class="size-4" />
						{order.customer.phone.replace('+57', '')}
					</Button>
					<Button
						href={whatsappLink(order.customer.phone, greeting)}
						target="_blank"
						rel="noopener"
						class="h-10 bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"
					>
						<MessageCircle class="size-4" />
						WhatsApp
					</Button>
				</div>
			</section>

			{#if order.address && maps}
				<section class="flex flex-col gap-2">
					<h3 class="text-sm font-semibold text-muted-foreground">Entrega</h3>
					<p class="flex items-start gap-2">
						<MapPin class="mt-0.5 size-4 shrink-0" />
						<span>
							<span class="font-semibold">{order.address.text}</span>
							{#if order.address.neighborhood}
								<span class="block text-sm">{order.address.neighborhood}</span>
							{/if}
							{#if order.address.references}
								<span class="block text-sm text-muted-foreground">{order.address.references}</span>
							{/if}
							<span class="block text-sm text-muted-foreground">
								A {order.address.distanceKm} km de la sede
							</span>
						</span>
					</p>
					<div class="flex flex-wrap gap-2">
						<Button
							href={maps.google}
							target="_blank"
							rel="noopener"
							variant="outline"
							class="h-10"
						>
							<Navigation class="size-4" /> Google Maps
						</Button>
						<Button href={maps.waze} target="_blank" rel="noopener" variant="outline" class="h-10">
							<Navigation class="size-4" /> Waze
						</Button>
					</div>
				</section>
			{/if}

			<Separator />

			<section class="flex flex-col gap-2">
				<h3 class="text-sm font-semibold text-muted-foreground">Pedido</h3>
				<ul class="flex flex-col gap-2">
					{#each order.items as item, index (index)}
						<li class="flex justify-between gap-3">
							<span>
								<span class="font-semibold"
									><span class="tabular">{item.qty}×</span> {item.name}</span
								>
								{#each item.modifiers as modifier (modifier.groupName + modifier.name)}
									<span class="block text-sm text-muted-foreground">
										{modifier.groupName}: {modifier.name}
									</span>
								{/each}
								{#if item.note}
									<span class="block text-sm font-medium text-caution">«{item.note}»</span>
								{/if}
							</span>
							<span class="tabular shrink-0">{formatMoney(item.total)}</span>
						</li>
					{/each}
				</ul>
				{#if order.notes}
					<p class="rounded-lg bg-caution/10 p-2 text-sm text-caution">{order.notes}</p>
				{/if}
				<dl class="flex flex-col gap-1 pt-2 text-sm">
					<div class="flex justify-between text-muted-foreground">
						<dt>Subtotal</dt>
						<dd class="tabular">{formatMoney(order.totals.subtotal)}</dd>
					</div>
					{#if order.fulfillment === 'delivery'}
						<div class="flex justify-between text-muted-foreground">
							<dt>Domicilio</dt>
							<dd class="tabular">{formatMoney(order.totals.deliveryFee)}</dd>
						</div>
					{/if}
					<div class="flex justify-between font-semibold">
						<dt>{PAYMENT_METHOD_LABEL[order.payment.method]}</dt>
						<dd class="tabular">
							{#if order.payment.method === 'cash' && order.payment.cashTendered !== null}
								Paga con {formatMoney(order.payment.cashTendered)} · cambio {formatMoney(
									order.payment.change
								)}
							{:else if order.payment.method === 'cash'}
								Paga exacto
							{:else}
								Llevar datáfono
							{/if}
						</dd>
					</div>
				</dl>
			</section>

			<Separator />

			<section class="flex flex-col gap-2">
				<h3 class="text-sm font-semibold text-muted-foreground">Historial</h3>
				<ol class="flex flex-col gap-1.5 text-sm">
					{#each order.events as event, index (index)}
						<li class="flex justify-between gap-3">
							<span>
								{ORDER_STATUS_LABEL[event.status]}
								<span class="text-muted-foreground">
									· {actorLabel(event.actorRole)}
								</span>
							</span>
							<span class="tabular text-muted-foreground">{time.format(new Date(event.at))}</span>
						</li>
					{/each}
				</ol>
			</section>
		</div>

		<div class="flex flex-col gap-3 border-t border-border bg-popover p-5">
			{#if moveError}
				<p class="rounded-lg bg-destructive/10 p-2 text-sm font-medium text-destructive">
					{moveError}
				</p>
			{/if}

			{#if action && canMoveTo(role, action.to)}
				<form method="POST" action="?/move" use:enhance={track}>
					<input type="hidden" name="orderId" value={order.id} />
					<input type="hidden" name="to" value={action.to} />
					<Button type="submit" class="h-12 w-full text-base" disabled={submitting}>
						{action.label}
					</Button>
				</form>
			{/if}

			{#if order.status === 'dispatched' && canMoveTo(role, 'failed_delivery')}
				<form method="POST" action="?/move" use:enhance={track}>
					<input type="hidden" name="orderId" value={order.id} />
					<input type="hidden" name="to" value="failed_delivery" />
					<Button type="submit" variant="outline" class="h-11 w-full" disabled={submitting}>
						No se pudo entregar
					</Button>
				</form>
			{/if}

			{#if order.status === 'failed_delivery' && canMoveTo(role, 'returned')}
				<form method="POST" action="?/move" use:enhance={track}>
					<input type="hidden" name="orderId" value={order.id} />
					<input type="hidden" name="to" value="returned" />
					<Button type="submit" variant="outline" class="h-11 w-full" disabled={submitting}>
						Volvió al local
					</Button>
				</form>
			{/if}

			{#if cancellable}
				<form method="POST" action="?/move" class="flex gap-2" use:enhance={track}>
					<input type="hidden" name="orderId" value={order.id} />
					<input type="hidden" name="to" value="cancelled" />
					<select
						name="reason"
						bind:value={reason}
						class="h-11 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
						aria-label="Motivo de la cancelación"
					>
						{#each CANCEL_REASONS as option (option)}
							<option value={option}>{CANCEL_REASON_LABEL[option]}</option>
						{/each}
					</select>
					<Button type="submit" variant="destructive" class="h-11" disabled={submitting}>
						{order.status === 'received' ? 'Rechazar' : 'Cancelar'}
					</Button>
				</form>
			{/if}
		</div>
	</Drawer.Content>
</Drawer.Root>
