<script lang="ts">
	import type { StaffOrder } from '$lib/domain/panel';

	import Bike from '@lucide/svelte/icons/bike';
	import Store from '@lucide/svelte/icons/store';

	import { enhance } from '$app/forms';

	import { Button } from '$lib/components/atoms/button';
	import { elapsedLabel, minutesSince, primaryAction } from '$lib/domain/panel';
	import { cn } from '$lib/utils';

	interface Props {
		order: StaffOrder;
		now: Date;
	}

	let { order, now }: Props = $props();

	let submitting = $state(false);

	const minutes = $derived(minutesSince(order.createdAt, now));
	const action = $derived(primaryAction(order));
	// Más de la mitad del tiempo prometido ya se fue: hay que apurar.
	const late = $derived(minutes > order.etaMinutes / 2);
</script>

<article
	class={cn(
		'flex flex-col gap-3 rounded-2xl bg-background p-5 shadow-sm',
		late && 'ring-2 ring-caution'
	)}
>
	<header class="flex items-start justify-between gap-2">
		<div>
			<span class="font-display text-4xl leading-none font-extrabold">#{order.number}</span>
			<span class="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
				{#if order.fulfillment === 'delivery'}
					<Bike class="size-4" /> Domicilio
				{:else}
					<Store class="size-4" /> Recoger
				{/if}
				· {order.customer.name.split(' ')[0]}
			</span>
		</div>
		<span class={cn('tabular text-sm', late ? 'font-bold text-caution' : 'text-muted-foreground')}>
			{elapsedLabel(minutes)}
		</span>
	</header>

	<ul class="flex flex-col gap-2">
		{#each order.items as item, index (index)}
			<li class="text-lg">
				<span class="font-bold"><span class="tabular">{item.qty}×</span> {item.name}</span>
				{#each item.modifiers as modifier (modifier.groupName + modifier.name)}
					<span class="block text-base text-muted-foreground">
						{modifier.groupName}: <strong class="text-foreground">{modifier.name}</strong>
					</span>
				{/each}
				{#if item.note}
					<span
						class="mt-1 block rounded-lg bg-caution/10 px-2 py-1 text-base font-semibold text-caution"
					>
						{item.note}
					</span>
				{/if}
			</li>
		{/each}
	</ul>

	{#if order.notes}
		<p class="rounded-lg bg-caution/10 p-2 font-medium text-caution">{order.notes}</p>
	{/if}

	{#if action}
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
			<Button type="submit" class="h-14 w-full text-lg" disabled={submitting}>
				{submitting ? 'Guardando…' : action.label}
			</Button>
		</form>
	{/if}
</article>
