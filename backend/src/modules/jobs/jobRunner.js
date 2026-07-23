import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { processEmailOutbox } from '../email/email.service.js';
import { runReconciliation } from './reconciliation.service.js';

function guardedInterval(name, fn, intervalMs) {
  let running = false;
  const execute = async () => {
    if (running) return;
    running = true;
    try {
      const result = await fn();
      logger.info({ event: name, ...result }, `${name} completed`);
    } catch (error) {
      logger.error({ err: error, event: name }, `${name} failed`);
    } finally {
      running = false;
    }
  };
  const timer = setInterval(execute, intervalMs);
  return { timer, execute };
}

export function startBackgroundJobs() {
  const jobs = [];
  if (env.ENABLE_VOUCHER_RECONCILIATION_JOB) {
    jobs.push(guardedInterval('reconciliation_job', runReconciliation, env.RECONCILIATION_INTERVAL_MS));
  }
  if (env.ENABLE_EMAIL_WORKER) {
    jobs.push(guardedInterval('email_worker', processEmailOutbox, env.EMAIL_WORKER_INTERVAL_MS));
  }
  return {
    jobs,
    stop() {
      jobs.forEach(({ timer }) => clearInterval(timer));
    },
  };
}
