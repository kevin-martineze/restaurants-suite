// See https://svelte.dev/docs/kit/types#app.d.ts
import type { PanelSession } from '$lib/domain/staff';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** Sesión del panel, ya descifrada y vigente; null si no hay. */
			session: PanelSession | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
