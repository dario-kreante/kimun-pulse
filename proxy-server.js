const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

const PORT = 3001; // Usaremos un puerto diferente para el proxy
const SUPABASE_URL = 'https://etmbspkgeofygcowsylp.supabase.co';

// Configuración de CORS para permitir peticiones desde cualquier origen
// Esto es aceptable para un entorno de pruebas local.
app.use(cors());

// Redirigir todas las peticiones a Supabase
app.use('/', createProxyMiddleware({
  target: SUPABASE_URL,
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // Supabase usa el host para enrutar, así que nos aseguramos de que sea el correcto.
    proxyReq.setHeader('host', new URL(SUPABASE_URL).host);
  },
}));

app.listen(PORT, () => {
  console.log(`CORS Proxy server running on http://localhost:${PORT}`);
  console.log(`Redirecting requests to: ${SUPABASE_URL}`);
}); 