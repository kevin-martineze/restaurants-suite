<script lang="ts">
	import type { Map as LeafletMap } from 'leaflet';
	import type { GeoPoint } from '$lib/domain/menu';

	import { untrack } from 'svelte';

	import LocateFixed from '@lucide/svelte/icons/locate-fixed';
	import MapPin from '@lucide/svelte/icons/map-pin';

	import { env } from '$env/dynamic/public';

	import { cn } from '$lib/utils';

	interface Props {
		/** Dónde arranca el mapa: el punto guardado del cliente o la sede. */
		initial: GeoPoint;
		/** Si `initial` ya es el punto del cliente (lo marcó en un pedido anterior). */
		hasPoint: boolean;
		onChange: (point: GeoPoint) => void;
	}

	let { initial, hasPoint, onChange }: Props = $props();

	const TILES = env.PUBLIC_MAP_TILES_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
	const ATTRIBUTION = env.PUBLIC_MAP_ATTRIBUTION || '© OpenStreetMap';

	let container = $state<HTMLDivElement | null>(null);
	let map: LeafletMap | null = null;
	let moved = $state(untrack(() => hasPoint));
	let locating = $state(false);
	let locateError = $state<string | null>(null);

	/** Seis decimales: unos 10 cm. Más precisión es ruido del GPS. */
	function round(value: number): number {
		return Math.round(value * 1e6) / 1e6;
	}

	// Leaflet se carga solo en el checkout y solo en el navegador: la carta no
	// paga sus ~40 KB.
	$effect(() => {
		if (!container) return;

		const element = container;
		const start = untrack(() => initial);
		const startZoom = untrack(() => (hasPoint ? 17 : 15));
		let cancelled = false;
		let instance: LeafletMap | null = null;

		void (async () => {
			const { default: L } = await import('leaflet');

			await import('leaflet/dist/leaflet.css');

			if (cancelled) return;

			instance = L.map(element, { zoomControl: false }).setView([start.lat, start.lng], startZoom);
			L.tileLayer(TILES, { maxZoom: 19, attribution: ATTRIBUTION }).addTo(instance);
			L.control.zoom({ position: 'bottomright' }).addTo(instance);

			// Se escucha después de centrar: el centro inicial no cuenta como
			// elección del cliente.
			instance.on('moveend', () => {
				if (!instance) return;

				const center = instance.getCenter();

				moved = true;
				onChange({ lat: round(center.lat), lng: round(center.lng) });
			});

			map = instance;
		})();

		return () => {
			cancelled = true;
			instance?.remove();
			map = null;
		};
	});

	function locate() {
		if (!navigator.geolocation) {
			locateError = 'Tu celular no deja usar la ubicación. Mueve el mapa hasta tu casa.';

			return;
		}

		locating = true;
		locateError = null;
		navigator.geolocation.getCurrentPosition(
			(position) => {
				locating = false;
				map?.setView([position.coords.latitude, position.coords.longitude], 18);
			},
			() => {
				locating = false;
				locateError = 'No pudimos ver tu ubicación. Mueve el mapa hasta tu casa.';
			},
			{ enableHighAccuracy: true, timeout: 10000 }
		);
	}
</script>

<div class="flex flex-col gap-2">
	<div class="relative isolate h-64 overflow-hidden rounded-2xl bg-muted sm:h-80">
		<div bind:this={container} class="absolute inset-0 z-0"></div>

		<!-- El pin no se arrastra: se mueve el mapa debajo, como en las apps de transporte. -->
		<div
			class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
			aria-hidden="true"
		>
			<MapPin class="-mt-10 size-10 fill-primary text-primary-foreground drop-shadow-lg" />
		</div>

		{#if !moved}
			<p
				class="pointer-events-none absolute inset-x-3 top-3 z-10 rounded-full bg-foreground/85 px-4 py-2 text-center text-sm font-medium text-background"
			>
				Mueve el mapa hasta tu casa
			</p>
		{/if}

		<button
			type="button"
			class={cn(
				'absolute bottom-3 left-3 z-10 flex h-10 items-center gap-2 rounded-full bg-background px-4 text-sm font-semibold shadow-lg transition-opacity',
				locating && 'opacity-70'
			)}
			disabled={locating}
			onclick={locate}
		>
			<LocateFixed class="size-4" />
			{locating ? 'Buscando…' : 'Usar mi ubicación'}
		</button>
	</div>

	{#if locateError}
		<p class="text-sm text-caution">{locateError}</p>
	{/if}
</div>
