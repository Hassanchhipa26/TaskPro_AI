const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://taskpro-ai-8302.onrender.com',
      changeOrigin: true,
    })
  );
};