import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

describe('Health & Readiness Endpoints', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Liveness probe should return 200 (cheap)', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, status: 'live' });
  });

  it('Readiness probe should return 200 when DB is up', async () => {
    vi.spyOn(prisma, '$queryRaw').mockResolvedValue([{ 1: 1 }]);
    
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, status: 'ready' });
  });

  it('Readiness probe should return 503 when DB is down', async () => {
    vi.spyOn(prisma, '$queryRaw').mockRejectedValue(new Error('DB Connection Refused'));
    
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ success: false, status: 'not_ready', code: 'DATABASE_NOT_READY' });
  });

  it('Readiness probe should return 503 on timeout', async () => {
    vi.spyOn(prisma, '$queryRaw').mockImplementation(() => new Promise((resolve) => {
      // never resolve, let the timeout inside app.js trigger
    }));
    
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ success: false, status: 'not_ready', code: 'DATABASE_NOT_READY' });
  });
});
