import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			$components: "./src/components",
			$images: "./src/images",
		},
		inlineStyleThreshold: 2048,
		serviceWorker: {
			register: false,
		},
		paths: {
			relative: false,
		},
	},
};

export default config;
