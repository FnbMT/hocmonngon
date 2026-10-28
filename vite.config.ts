import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'sepay-dev-api',
        configureServer(server) {
          server.middlewares.use('/api/sepay-webhook', (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

            if (req.method === 'OPTIONS') {
              res.statusCode = 200;
              res.end();
              return;
            }

            if (req.method === 'GET') {
              res.statusCode = 200;
              res.end(JSON.stringify({ status: 'active', message: 'SePay Webhook Dev Endpoint' }));
              return;
            }

            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  console.log('[Dev Webhook Received]:', body);
                  res.statusCode = 200;
                  res.end(JSON.stringify({ success: true, message: 'Received successfully' }));
                } catch {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false, message: 'Invalid payload' }));
                }
              });
              return;
            }

            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          });
        }
      }
    ],
  };
});
