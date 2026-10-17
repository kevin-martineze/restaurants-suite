import node from '@sveltejs/adapter-node';
import vercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Vercel define `VERCEL` durante su build; en contenedores se usa Node.
		adapter: process.env.VERCEL ? vercel({ runtime: 'nodejs22.x' }) : node(),
		alias: {
			$lib: 'src/lib'
		}
	},
	compilerOptions: {
		runes: true
	}
};

export default config;
