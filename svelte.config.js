import node from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: node(),
		alias: {
			$lib: 'src/lib'
		}
	},
	compilerOptions: {
		runes: true
	}
};

export default config;
