/**
 * Re-export PrismaClient instance from the central config.
 * This alias exists so modules can import from either
 * '../../config/database.js' or '../../config/prisma.js'.
 */
export { prisma } from './prisma.js';
