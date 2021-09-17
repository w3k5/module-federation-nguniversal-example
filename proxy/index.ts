import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 3000;
const REMOTE_ENTRY = 'http://localhost:4221/';
const HOST_URL = 'http://localhost:5000/';

app.use(
  '/api/*',
  createProxyMiddleware({
    target: REMOTE_ENTRY,
    changeOrigin: true,
  })
);

// app.use('*', createProxyMiddleware({ target: HOST_URL }));
app.listen(PORT);
