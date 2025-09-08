// frontend/src/setupProxy.js

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      // 👇 THIS IS OUR DEBUG LOG 👇
      onProxyReq: function(proxyReq, req, res) {
        console.log('✅ [Proxy] Forwarding request:', req.method, req.originalUrl, '->', 'http://localhost:8000' + proxyReq.path);
      }
    })
  );
};