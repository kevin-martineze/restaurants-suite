<script lang="ts">
	import type { KitchenLoad } from '$lib/domain/menu';
	import type { BranchLive } from '$lib/domain/panel';
	import type { Role } from '$lib/domain/staff';

	import Bell from '@lucide/svelte/icons/bell';
	import BellOff from '@lucide/svelte/icons/bell-off';
	import ChefHat from '@lucide/svelte/icons/chef-hat';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';

	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	import { KITCHEN_LOAD_LABEL } from '$lib/domain/panel';
	import { ROLE_LABEL } from '$lib/domain/staff';
	import { cn } from '$lib/utils';

	interface Props {
		tenantName: string;
		userName: string;
		role: Role;
		branch: BranchLive;
		menuSlug: string | null;
		soundOn: boolean;
		onToggleSound: () => void;
	}

	let { tenantName, userName, role, branch, menuSlug, soundOn, onToggleSound }: Props = $props();

	// Pausar y marcar la carga es de quien maneja el turno, no de la cocina.
	const canManage = $derived(role === 'owner' || role === 'manager' || role === 'cashier');
	const paused = $derived(branch.status === 'paused');
	const loads: KitchenLoad[] = ['calm', 'busy', 'saturated'];
	const views = [
		{ href: '/panel', label: 'Tablero', icon: LayoutGrid },
		{ href: '/cocina', label: 'Cocina', icon: ChefHat }
	];
</script>

<header class="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xl">
	<div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 lg:px-6">
		<div class="flex min-w-0 flex-col">
			<span class="truncate font-display text-lg leading-tight font-extrabold">{tenantName}</span>
			<span class="truncate text-xs text-muted-foreground">
				{branch.name} · {userName} ({ROLE_LABEL[role]})
			</span>
		</div>

		<nav class="flex items-center gap-1 rounded-full bg-secondary p-1" aria-label="Vistas">
			{#each views as view (view.href)}
				<a
					href={view.href}
					aria-current={page.url.pathname === view.href ? 'page' : undefined}
					class={cn(
						'flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors',
						page.url.pathname === view.href
							? 'bg-background shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
					)}
				>
					<view.icon class="size-4" />
					{view.label}
				</a>
			{/each}
		</nav>

		<div class="ml-auto flex flex-wrap items-center gap-2">
			{#if canManage}
				<form
					method="POST"
					action="/panel?/branch"
					use:enhance
					class="flex items-center gap-1 rounded-full bg-secondary p-1"
				>
					<span class="pl-2 text-xs font-semibold text-muted-foreground">Cocina</span>
					{#each loads as load (load)}
						<button
							type="submit"
							name="kitchenLoad"
							value={load}
							aria-pressed={branch.kitchen.load === load}
							class={cn(
								'h-8 rounded-full px-3 text-xs font-semibold transition-colors',
								branch.kitchen.load === load
									? load === 'calm'
										? 'bg-background shadow-sm'
										: load === 'busy'
											? 'bg-caution text-caution-foreground'
											: 'bg-destructive text-destructive-foreground'
									: 'text-muted-foreground hover:text-foreground'
							)}
						>
							{KITCHEN_LOAD_LABEL[load]}
						</button>
					{/each}
				</form>

				<form method="POST" action="/panel?/branch" use:enhance>
					<input type="hidden" name="status" value={paused ? 'open' : 'paused'} />
					<button
						type="submit"
						class={cn(
							'flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors',
							paused
								? 'bg-caution text-caution-foreground'
								: 'bg-success/10 text-success hover:bg-success/20'
						)}
					>
						{#if paused}
							<Play class="size-4" />
							Pausado · reanudar
						{:else}
							<Pause class="size-4" />
							Recibiendo pedidos
						{/if}
					</button>
				</form>
			{/if}

			<button
				type="button"
				class={cn(
					'flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold',
					soundOn ? 'bg-secondary' : 'animate-pulse bg-caution text-caution-foreground'
				)}
				onclick={onToggleSound}
			>
				{#if soundOn}
					<Bell class="size-4" />
					<span class="max-sm:sr-only">Sonido</span>
				{:else}
					<BellOff class="size-4" />
					Activar sonido
				{/if}
			</button>

			{#if menuSlug}
				<a
					href={`/${menuSlug}`}
					target="_blank"
					rel="noopener"
					class="flex size-10 items-center justify-center rounded-full hover:bg-secondary"
					aria-label="Ver la carta"
				>
					<ExternalLink class="size-4" />
				</a>
			{/if}

			<form method="POST" action="/salir">
				<button
					type="submit"
					class="flex size-10 items-center justify-center rounded-full hover:bg-secondary"
					aria-label="Salir"
				>
					<LogOut class="size-4" />
				</button>
			</form>
		</div>
	</div>
</header>
