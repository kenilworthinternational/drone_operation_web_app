const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * CRA dev server only: proxy API calls so localhost:3000 avoids CORS.
 * - /api      → Node backend (dsms-web-api-dev or production)
 * - /php-api  → Legacy PHP API (drone-admin-test or production)
 */
module.exports = function setupProxy(app) {
  const nodeTarget =
    process.env.REACT_APP_NODE_API_PROXY ||
    (process.env.REACT_APP_ENV === 'production'
      ? 'https://dsms-web-api.kenilworthinternational.com'
      : 'https://dsms-web-api-dev.kenilworthinternational.com');

  const phpTarget =
    process.env.REACT_APP_PHP_API_PROXY ||
    (process.env.REACT_APP_ENV === 'production'
      ? 'https://drone-admin.kenilworthinternational.com'
      : 'https://drone-admin-test.kenilworthinternational.com');

  app.use(
    '/php-api',
    createProxyMiddleware({
      target: phpTarget,
      changeOrigin: true,
      secure: true,
      pathRewrite: { '^/php-api': '/api' },
      logLevel: process.env.REACT_APP_PROXY_DEBUG === '1' ? 'debug' : 'warn',
    })
  );

  app.use(
    '/api',
    createProxyMiddleware({
      target: nodeTarget,
      changeOrigin: true,
      secure: true,
      logLevel: process.env.REACT_APP_PROXY_DEBUG === '1' ? 'debug' : 'warn',
    })
  );

  app.use(
    ['/uploads', '/documents'],
    createProxyMiddleware({
      target: nodeTarget,
      changeOrigin: true,
      secure: true,
      logLevel: 'warn',
    })
  );
};