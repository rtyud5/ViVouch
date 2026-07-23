import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';
import { startBackgroundJobs } from './modules/jobs/jobRunner.js';

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'API server started');
});
const jobRunner = startBackgroundJobs();

async function shutdown(signal) {
  logger.info({ signal }, 'Graceful shutdown started');
  jobRunner.stop();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
