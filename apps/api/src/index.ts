import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { auditRouter } from './routes/audit';
import { logger } from './config/logger';
import { initWorkers } from './workers';

const app = express();
const PORT = parseInt(process.env.PORT ?? '4000', 10);

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Strict limiter for audit creation only (POST)
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many audit requests. Please wait before starting another.' },
  skip: (req) => req.method !== 'POST',
});

// Generous limiter for reads/polling (GET, DELETE, etc.)
const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { error: 'Too many requests. Please slow down.' },
  skip: (req) => req.method === 'POST',
});

app.use('/api/audits', createLimiter);
app.use('/api/audits', readLimiter);

// Routes
app.use('/api/audits', auditRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

async function bootstrap() {
  await initWorkers();
  app.listen(PORT, () => {
    logger.info(`API server running on port ${PORT}`);
  });
}

bootstrap().catch(err => {
  logger.error('Failed to start server', { error: err });
  process.exit(1);
});
