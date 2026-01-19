const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Proxy configuration for Odoo API (to avoid CORS issues in web)
config.server = {
    ...config.server,
    enhanceMiddleware: (middleware) => {
        return (req, res, next) => {
            // Add CORS headers for development
            res.setHeader('Access-Control-Allow-Origin', '*');
            return middleware(req, res, next);
        };
    },
};

module.exports = config;
