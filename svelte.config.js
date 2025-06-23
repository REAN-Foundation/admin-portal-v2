import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
    maxRequestSize: 10 * 1024 * 1024,
	kit: {
		adapter: adapter({ 
			out: 'build',
			// Add server configuration for larger body sizes
			// server: {
			// 	// Increase body parser limit
			// 	bodyParser: {
			// 		limit: '10mb'
			// 	}
			// }
		}),
		alias: {
			$routes: path.resolve('./src/routes'),
			$lib: path.resolve('./src/lib')
		}
	}
};

export default config;
