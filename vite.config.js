import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const externalPort = Number(env.VITE_PORT);

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
            origin: `http://10.166.20.85:${externalPort}`,
            hmr: {
                host: '10.166.20.85',
                port: 5173,             // Internal WebSocket server port
                clientPort: externalPort, // External port exposed to the browser
                protocol: 'ws',
            },
            watch: {
                ignored: ['**/storage/framework/views/**'],
            },
        },
    };
});