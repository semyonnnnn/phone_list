import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const externalPort = Number(env.VITE_PORT) || 5173;
    const hmrHost = env.VITE_HMR_HOST || 'localhost';

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                refresh: true,
            }),
            tailwindcss(),
            react(),
        ],
        server: {
            host: '0.0.0.0',
            port: 5173,
            strictPort: true,
            cors: true,
            origin: `http://${hmrHost}:${externalPort}`,
            hmr: {
                host: hmrHost,
                port: 5173,
                clientPort: externalPort,
                protocol: 'ws',
            },
            watch: {
                ignored: ['**/storage/framework/views/**'],
            },
        },
    };
});
