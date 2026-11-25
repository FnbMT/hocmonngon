import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import adminAuthHandler from './api/admin-auth.ts';

// Load local .env / .env.local for server-side dev middlewares (e.g. ADMIN_PASSWORD)
dotenv.config({ path: path.resolve(import.meta.dirname, '.env.local') });
dotenv.config({ path: path.resolve(import.meta.dirname, '.env') });

const DEV_STATE_FILE = path.resolve(import.meta.dirname, '.studio-dev-state.json');

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/.studio-dev-state.json'],
      },
    },
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'studio-dev-persistence',
        configureServer(server) {
          server.middlewares.use('/api/dev-state', (req, res) => {
            res.setHeader('Content-Type', 'application/json');

            if (req.method === 'GET') {
              try {
                if (fs.existsSync(DEV_STATE_FILE)) {
                  const raw = fs.readFileSync(DEV_STATE_FILE, 'utf-8');
                  const parsed = JSON.parse(raw);
                  res.statusCode = 200;
                  res.end(JSON.stringify({ exists: true, ...parsed }));
                  return;
                }
              } catch (err) {
                console.warn('[DevState GET Error]:', err);
              }
              res.statusCode = 200;
              res.end(JSON.stringify({ exists: false, state: {} }));
              return;
            }

            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  const parsed = JSON.parse(body || '{}');
                  const payload = {
                    updatedAt: parsed.updatedAt || Date.now(),
                    state: parsed.state || {}
                  };
                  fs.writeFileSync(DEV_STATE_FILE, JSON.stringify(payload), 'utf-8');
                  res.statusCode = 200;
                  res.end(JSON.stringify({ success: true, updatedAt: payload.updatedAt }));
                } catch (err) {
                  console.warn('[DevState POST Error]:', err);
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false }));
                }
              });
              return;
            }

            if (req.method === 'DELETE') {
              try {
                if (fs.existsSync(DEV_STATE_FILE)) {
                  fs.unlinkSync(DEV_STATE_FILE);
                }
              } catch (err) {
                console.warn('[DevState DELETE Error]:', err);
              }
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
              return;
            }

            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          });
        }
      },
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
      },
      {
        name: 'admin-auth-dev-api',
        configureServer(server) {
          server.middlewares.use('/api/admin-auth', (req, res) => {
            void adminAuthHandler(req, res);
          });
        }
      }
    ],
  };
});
