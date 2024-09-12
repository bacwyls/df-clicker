import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/*
If you are developing a UI outside of a Kinode project,
comment out the following 2 lines:
*/
import manifest from '../pkg/manifest.json'
import metadata from '../metadata.json'
// import path from 'path';

/*
IMPORTANT:
This must match the process name from pkg/manifest.json + pkg/metadata.json
The format is "/" + "process_name:package_name:publisher_node"
*/
const PACKAGE_SUBDOMAIN = `df-clicker-template-os`;
const BASE_URL = `/df_clicker:df_clicker:template.os`;

// This is the proxy URL, it must match the node you are developing against
const PROXY_URL = (process.env.VITE_NODE_URL || `http://${PACKAGE_SUBDOMAIN}.localhost:8080`)
console.log('process.env.VITE_NODE_URL', process.env.VITE_NODE_URL, PROXY_URL);

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'redirect-localhost',
      transformIndexHtml(html) {
        return html.replace(
          /<head>/,
          `<head>
            <script>
              if (window.location.hostname === 'localhost') {
                window.location.hostname = '${PACKAGE_SUBDOMAIN}.localhost';
              }
            </script>`
        );
      },
    },
  ],
  base: BASE_URL,
  build: {
    manifest: true,
    rollupOptions: {
      external: ['/our.js', 'react-router-dom']
      // external: ['/our.js']
    }
  },
  server: {
    open: true,
    hmr: {
      host: `${PACKAGE_SUBDOMAIN}.localhost`, // Explicit HMR host
      port: 3000, // Ensure the port is correctly specified for WebSocket connections
    },
    proxy: {
      '/our': {
        target: PROXY_URL,
        changeOrigin: true,
      },
      [`${BASE_URL}/our.js`]: {
        target: PROXY_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(BASE_URL, ''),
      },
      // This route will match all other HTTP requests to the backend
      // [`^${BASE_URL}/(?!(@vite/client|src/.*|node_modules/.*|@react-refresh|.*\.ts$))`]: {
      //   target: PROXY_URL,
      //   changeOrigin: true,
      // },
      // '/example': {
      //   target: PROXY_URL,
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(BASE_URL, ''),
      // // This is only for debugging purposes
      //   configure: (proxy, _options) => {
      //     proxy.on('error', (err, _req, _res) => {
      //       console.log('proxy error', err);
      //     });
      //     proxy.on('proxyReq', (proxyReq, req, _res) => {
      //       console.log('Sending Request to the Target:', req.method, req.url);
      //     });
      //     proxy.on('proxyRes', (proxyRes, req, _res) => {
      //       console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
      //     });
      //   },
      // },
    }
  }
});
