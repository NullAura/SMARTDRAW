const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');

function createCorsOptions(allowedOrigins) {
  return {
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const error = new Error('CORS_ORIGIN_DENIED');
      error.status = 403;
      return callback(error);
    }
  };
}

function createApp({ allowedOrigins = ['http://127.0.0.1:5173', 'http://localhost:5173'] } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('query parser', 'simple');

  app.use(helmet());
  app.use(cors(createCorsOptions(allowedOrigins)));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, message: '请求过于频繁，请稍后再试' }
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy' });
  });

  app.use('/api/auth', authLimiter, require('./routes/auth'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/works', require('./routes/works'));
  app.use('/api/reviews', require('./routes/reviews'));
  app.use('/api/merchant', authLimiter, require('./routes/merchant'));

  app.use((_req, res) => {
    res.status(404).json({ success: false, message: '接口不存在' });
  });

  app.use((err, _req, res, _next) => {
    const status = Number.isInteger(err.status) ? err.status : 500;
    if (status >= 500) {
      console.error(err);
    }
    res.status(status).json({
      success: false,
      message: status === 403 ? '来源不在允许列表中' : '服务器内部错误'
    });
  });

  return app;
}

module.exports = { createApp, createCorsOptions };
