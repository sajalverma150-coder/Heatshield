import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function weatherProxyPlugin(): Plugin {
  return {
    name: 'weather-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/api/weather-proxy', async (req, res) => {
        try {
          const parsedUrl = new URL(req.url || '', 'http://localhost:3000');
          const targetUrl = parsedUrl.searchParams.get('url');
          if (!targetUrl || !targetUrl.startsWith('https://api.open-meteo.com')) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid or missing target URL' }));
            return;
          }
          const response = await fetch(targetUrl);
          const data = await response.text();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = response.status;
          res.end(data);
        } catch (e: any) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: e?.message || 'Proxy fetch failed' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), weatherProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
