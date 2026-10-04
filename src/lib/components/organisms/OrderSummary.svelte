<script lang="ts">
	import type { CartLine } from '$lib/domain/cart';
	import type { CheckoutPreview } from '$lib/domain/checkout';

	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import Clock from '@lucide/svelte/icons/clock';

	import { Separator } from '$lib/components/atoms/separator';
	import { formatMoney } from '$lib/utils/money';

	interface Props {
		/** Lo que hay en el carrito, para pintar mientras llega la cotización. */
		lines: CartLine[];
		/** La cotización del servidor; `null` mientras carga. */
		preview: CheckoutPreview | null;
		delivery: boolean;
	}

	let { lines, preview, delivery }: Props = $props();

	const rejected = $derived(
		new Map(preview?.rejected.map((line) => [line.key, line.reason]) ?? [])
	);
	const subtotal = $derived(
		preview?.subtotal ?? lines.reduce((sum, line) => sum + line.preview.unitPrice * line.qty, 0)
	);
</script>

<section class="flex flex-col gap-4" aria-labelledby="resumen">
	<h2 id="resumen" class="font-display text-2xl font-extrabold tracking-tight">Tu pedido</h2>

	<ul class="flex flex-col gap-3">
		{#each lines as line (line.key)}
			<li class="flex items-start justify-between gap-3">
				<div class="flex min-w-0 flex-col">
					<span class="font-medium">
						<span class="tabular text-muted-foreground">{line.qty}×</span>
						{line.preview.name}
					</span>
					{#if line.preview.modifiersLabel}
						<span class="text-sm text-muted-foreground">{line.preview.modifiersLabel}</span>
					{/if}
					{#if line.note}
						<span class="text-sm text-muted-foreground italic">«{line.note}»</span>
					{/if}
					{#if rejected.get(line.key)}
						<span class="text-sm font-medium text-destructive">{rejected.get(line.key)}</span>
					{/if}
				</div>
				<span class="tabular shrink-0 font-semibold">
					{formatMoney(line.preview.unitPrice * line.qty)}
				</span>
			</li>
		{/each}
	</ul>

	<Separator />

	<dl class="flex flex-col gap-2">
		<div class="flex justify-between">
			<dt class="text-muted-foreground">Subtotal</dt>
			<dd class="tabular">{formatMoney(subtotal)}</dd>
		</div>
		{#if delivery}
			<div class="flex justify-between">
				<dt class="text-muted-foreground">
					Domicilio
					{#if preview?.distanceKm !== null && preview?.distanceKm !== undefined}
						<span class="text-sm">· {preview.distanceKm} km</span>
					{/if}
				</dt>
				<dd class="tabular">
					{#if preview && preview.blockers.length === 0}
						{preview.deliveryFee === 0 ? 'Gratis' : formatMoney(preview.deliveryFee)}
					{:else}
						<span class="text-muted-foreground">—</span>
					{/if}
				</dd>
			</div>
		{/if}
		<div class="flex items-baseline justify-between pt-1">
			<dt class="font-display text-lg font-bold">Total</dt>
			<dd class="tabular font-display text-2xl font-extrabold">
				{formatMoney(preview?.total ?? subtotal)}
			</dd>
		</div>
	</dl>

	{#if preview}
		{#if preview.blockers.length > 0}
			<div class="flex flex-col gap-1.5 rounded-xl bg-caution/10 p-3 text-sm text-caution">
				{#each preview.blockers as blocker (blocker)}
					<p class="flex items-start gap-2 font-medium">
						<CircleAlert class="mt-0.5 size-4 shrink-0" />
						{blocker}
					</p>
				{/each}
			</div>
		{:else}
			<p class="flex items-center gap-2 text-sm text-muted-foreground">
				<Clock class="size-4" />
				{delivery ? 'Llega' : 'Listo para recoger'} en unos {preview.etaMinutes} minutos
			</p>
		{/if}
	{/if}
</section>
