import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

describe('CMS content API', () => {
  const email = 'cms_admin@test.com';
  const password = 'Password123!';
  let token;

  const cleanup = async () => {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    await prisma.banner.deleteMany({ where: { title: { startsWith: 'CMS Test' } } });
    await prisma.cmsPage.deleteMany({ where: { slug: { startsWith: 'cms-test-' } } });
    await prisma.category.deleteMany({ where: { slug: { startsWith: 'cms-test-' } } });
    if (user) await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
    await prisma.user.deleteMany({ where: { email } });
  };

  beforeAll(async () => {
    await cleanup();
    const registered = await request(app).post('/api/auth/register').send({
      email,
      password,
      fullName: 'CMS Admin',
      phone: '0900099900',
    });
    await prisma.user.update({ where: { id: registered.body.data.id }, data: { role: 'ADMIN' } });
    token = (await request(app).post('/api/auth/login').send({ email, password })).body.data.accessToken;
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('requires admin role for content management', async () => {
    expect((await request(app).get('/api/admin/content/pages')).status).toBe(401);
  });

  it('supports category CRUD', async () => {
    const created = await request(app).post('/api/admin/content/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'CMS Test Category', slug: 'cms-test-category', icon: 'ticket' });
    expect(created.status).toBe(201);

    const updated = await request(app).patch(`/api/admin/content/categories/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'CMS Test Category Updated' });
    expect(updated.body.data.name).toBe('CMS Test Category Updated');

    const audit = await prisma.auditLog.findFirst({
      where: { targetId: created.body.data.id, action: 'ADMIN_MANAGE_CONTENT' },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit?.oldValues?.name).toBe('CMS Test Category');
    expect(audit?.newValues?.name).toBe('CMS Test Category Updated');

    expect((await request(app).delete(`/api/admin/content/categories/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)).status).toBe(204);
  });

  it('publishes pages and exposes only published content publicly', async () => {
    const created = await request(app).post('/api/admin/content/pages')
      .set('Authorization', `Bearer ${token}`)
      .send({ slug: 'cms-test-policy', title: 'CMS Test Policy', content: 'Policy content', status: 'DRAFT' });
    expect(created.status).toBe(201);
    expect((await request(app).get('/api/content/pages/cms-test-policy')).status).toBe(404);

    await request(app).patch(`/api/admin/content/pages/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'PUBLISHED' });
    const published = await request(app).get('/api/content/pages/cms-test-policy');
    expect(published.status).toBe(200);
    expect(published.body.data.content).toBe('Policy content');
  });

  it('supports banner management and public active-banner filtering', async () => {
    const created = await request(app).post('/api/admin/content/banners')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'CMS Test Banner',
        imageUrl: 'https://example.com/banner.png',
        position: 'POPUP',
        isActive: true,
        sortOrder: 1,
      });
    expect(created.status).toBe(201);
    const publicList = await request(app).get('/api/content/banners?position=POPUP');
    expect(publicList.status).toBe(200);
    expect(publicList.body.data.some((banner) => banner.id === created.body.data.id)).toBe(true);
  });
});
