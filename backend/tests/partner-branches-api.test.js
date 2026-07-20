import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

describe('Partner branches API', () => {
  const email = 'branch_partner@test.com';
  const otherEmail = 'branch_other@test.com';
  const password = 'Password123!';
  let token;
  let otherToken;
  let branchId;

  const cleanup = async () => {
    const users = await prisma.user.findMany({ where: { email: { in: [email, otherEmail] } } });
    const ids = users.map((user) => user.id);
    const partners = await prisma.partner.findMany({ where: { userId: { in: ids } } });
    await prisma.branch.deleteMany({ where: { partnerId: { in: partners.map((partner) => partner.id) } } });
    await prisma.partner.deleteMany({ where: { id: { in: partners.map((partner) => partner.id) } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
  };

  beforeAll(async () => {
    await cleanup();
    const passwordHash = await bcrypt.hash(password, 10);
    const [user, other] = await Promise.all([
      prisma.user.create({ data: { email, fullName: 'Branch Partner', passwordHash, role: 'PARTNER' } }),
      prisma.user.create({ data: { email: otherEmail, fullName: 'Other Partner', passwordHash, role: 'PARTNER' } }),
    ]);
    await Promise.all([
      prisma.partner.create({ data: { userId: user.id, businessName: 'Branch Partner', taxCode: 'BRANCH-TEST-1', representativeName: 'Rep', status: 'APPROVED' } }),
      prisma.partner.create({ data: { userId: other.id, businessName: 'Other Partner', taxCode: 'BRANCH-TEST-2', representativeName: 'Rep', status: 'APPROVED' } }),
    ]);
    token = (await request(app).post('/api/auth/login').send({ email, password })).body.data.accessToken;
    otherToken = (await request(app).post('/api/auth/login').send({ email: otherEmail, password })).body.data.accessToken;
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('creates, lists, updates and deletes an unused branch', async () => {
    const created = await request(app).post('/api/partner/branches')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Branch', address: '123 Test Street', city: 'Hà Nội', isActive: true });
    expect(created.status).toBe(201);
    branchId = created.body.data.id;

    const list = await request(app).get('/api/partner/branches').set('Authorization', `Bearer ${token}`);
    expect(list.body.data.some((branch) => branch.id === branchId)).toBe(true);

    const updated = await request(app).put(`/api/partner/branches/${branchId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isActive: false });
    expect(updated.body.data.isActive).toBe(false);

    const forbidden = await request(app).put(`/api/partner/branches/${branchId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ name: 'Stolen' });
    expect(forbidden.status).toBe(403);

    expect((await request(app).delete(`/api/partner/branches/${branchId}`)
      .set('Authorization', `Bearer ${token}`)).status).toBe(204);
  });
});
