<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	import { invalidate } from '$app/navigation';

	import PanelHeader from '$lib/components/organisms/PanelHeader.svelte';
	import { playChime, unlockChime } from '$lib/utils/chime';

	interface Props {
		data: LayoutData;
		children: Snippet;
	}

	let { data, children }: Props = $props();

	let soundOn = $state(false);

	async function toggleSound() {
		if (soundOn) {
			soundOn = false;

			return;
		}

		await unlockChime();
		soundOn = true;
		playChime();
	}

	// Avisos en vivo: un pedido nuevo suena y recarga el tablero; uno que
	// cambió solo recarga. EventSource se reconecta solo si se cae la red.
	$effect(() => {
		const source = new EventSource('/panel/eventos');
		const chime = () => {
			if (soundOn) playChime();
		};

		source.addEventListener('order', (event) => {
			if (event.data.includes('"kind":"created"')) chime();

			void invalidate('panel:orders');
		});

		// Red de seguridad: si el stream se perdió sin que nadie lo notara, el
		// tablero igual se pone al día cada minuto.
		const fallback = setInterval(() => void invalidate('panel:orders'), 60_000);

		return () => {
			source.close();
			clearInterval(fallback);
		};
	});

	// La tablet del restaurante no debe apagar la pantalla con pedidos abiertos.
	$effect(() => {
		let lock: WakeLockSentinel | null = null;
		let cancelled = false;

		const request = async () => {
			if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return;

			try {
				lock = await navigator.wakeLock.request('screen');

				if (cancelled) await lock.release();
			} catch {
				// Sin permiso o sin batería: la pantalla se apaga como siempre.
			}
		};
		const onVisibility = () => void request();

		void request();
		document.addEventListener('visibilitychange', onVisibility);

		return () => {
			cancelled = true;
			document.removeEventListener('visibilitychange', onVisibility);
			void lock?.release();
		};
	});
</script>

<div class="min-h-dvh bg-secondary/40">
	<PanelHeader
		tenantName={data.tenantName}
		userName={data.user?.name ?? ''}
		role={data.role}
		branch={data.branch}
		menuSlug={data.menuSlug}
		{soundOn}
		onToggleSound={toggleSound}
	/>
	{@render children()}
</div>
