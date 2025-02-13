import {
	defineConfig,
	//	type PluginOption
} from 'vite';
import react from '@vitejs/plugin-react';
import EnvironmentPlugin from 'vite-plugin-environment';
//import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath, URL } from 'url';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
	plugins: [
		nodePolyfills({
			include: ['buffer'],
		}),
		react(),
		EnvironmentPlugin('all'),
		/*
		visualizer({
			filename: './dist/bundle-stats.html',
			open: false,
		}) as PluginOption,
		 */
	],
	resolve: {
		alias: [
			{
				find: '@',
				replacement: fileURLToPath(new URL('./client', import.meta.url)),
			},
			{
				find: '@shared',
				replacement: fileURLToPath(new URL('./shared', import.meta.url)),
			},
			{
				find: 'three',
				replacement:
					'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.min.js',
			},
		],
	},
	css: {
		preprocessorOptions: {
			less: {
				javascriptEnabled: true,
			},
		},
	},
	build: {
		manifest: true,
		rollupOptions: {
			input: './index.html',
			output: {
				manualChunks: (id) => {
					let chunkName = '';
					if (id.includes('node_modules')) {
						chunkName = 'vendor';
					}
					if (
						id.includes('@react-three') ||
						id.includes('meshline') ||
						id.includes('its-fine')
					) {
						chunkName = 'three-helper';
					}
					if (id.includes('@ton')) {
						chunkName = '@ton';
					}
					if (
						id.includes('@tonconnect') ||
						id.includes('ua-parser-js') ||
						id.includes('tweetnacl') ||
						id.includes('deepmerge')
					)
						chunkName = '@tonconnect';
					if (
						id.includes('@solana') ||
						id.includes('borsh') ||
						id.includes('superstruct') ||
						id.includes('bn.js') ||
						id.includes('@noble') ||
						id.includes('jayson') ||
						id.includes('rpc-websockets') ||
						id.includes('bigint-buffer')
					)
						chunkName = '@solana';
					return chunkName;
				},
			},
		},
	},
	cacheDir: './.vite-cache',
});
