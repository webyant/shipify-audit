import { Redis } from 'ioredis';
import { logger } from './logger';

let redis: Redis;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });
    redis.on('error', (err) => logger.error('Redis error', { error: err.message }));
    redis.on('connect', () => logger.info('Redis connected'));
  }
  return redis;
}
