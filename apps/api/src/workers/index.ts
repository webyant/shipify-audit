import { Worker, Queue } from 'bullmq';
import { getRedis } from '../config/redis';
import { runAudit } from '../services/audit/orchestrator';
import { logger } from '../config/logger';

export const AUDIT_QUEUE_NAME = 'audit-queue';

let auditQueue: Queue;

export function getAuditQueue(): Queue {
  if (!auditQueue) {
    auditQueue = new Queue(AUDIT_QUEUE_NAME, {
      connection: getRedis(),
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 200 },
      },
    });
  }
  return auditQueue;
}

export const QUEUE_ENABLED =
  process.env.NODE_ENV === 'production' && !!process.env.REDIS_HOST;

export async function initWorkers(): Promise<void> {
  if (!QUEUE_ENABLED) {
    logger.info('Queue workers disabled (set NODE_ENV=production + REDIS_HOST to enable)');
    return;
  }

  const worker = new Worker(
    AUDIT_QUEUE_NAME,
    async (job) => {
      const { auditId } = job.data as { auditId: string };
      logger.info('Processing audit job', { jobId: job.id, auditId });
      await runAudit(auditId);
    },
    {
      connection: getRedis(),
      concurrency: parseInt(process.env.WORKER_CONCURRENCY ?? '3', 10),
    },
  );

  worker.on('completed', (job) => {
    logger.info('Audit job completed', { jobId: job.id });
  });

  worker.on('failed', (job, err) => {
    logger.error('Audit job failed', { jobId: job?.id, error: err.message });
  });

  logger.info('BullMQ workers initialized');
}
