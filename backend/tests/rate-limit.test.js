import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createRateLimiter } from '../src/middlewares/rateLimit.middleware.js';

describe('Rate limit middleware', () => {
  it('returns a stable 429 contract after the configured limit', async () => {
    const app = express();
    app.use(createRateLimiter({
      windowMs: 60_000,
      max: 2,
      message: 'Too many demo requests',
      skipInTest: false,
    }));
    app.get('/limited', (req, res) => res.json({ success: true }));

    expect((await request(app).get('/limited')).status).toBe(200);
    expect((await request(app).get('/limited')).status).toBe(200);
    const blocked = await request(app).get('/limited');
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      success: false,
      code: 'RATE_LIMITED',
      message: 'Too many demo requests',
    });
  });
});
