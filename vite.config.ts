import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { netlifyPlugin } from '@netlify/remix-adapter/plugin';

export default defineConfig({
    plugins: [
        remix({
            ignoredRouteFiles: ['**/*.module.scss'],
        }),
        netlifyPlugin(),
        tsconfigPaths(),
    ],
    resolve: {
        alias: { '~': __dirname },
    },
    optimizeDeps: {
        include: ['@radix-ui/react-select'],
    },
    css: { preprocessorOptions: { scss: { api: 'modern' } } },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.endsWith('.css') || id.endsWith('.scss')) {
                        return 'styles';
                    }
                },
            },
        },
    },
});
