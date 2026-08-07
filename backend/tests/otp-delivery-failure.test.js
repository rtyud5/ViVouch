import { beforeEach, afterAll, describe, expect, it, vi } from 'vitest';

const sendImmediateEmailMock = vi.hoisted(() => vi.fn());

vi.mock('../src/modules/email/email.service.js', async () => {
  const actual = await vi.importActual('../src/modules/email/email.service.js');
  return {
    ...actual,
    sendImmediateEmail: sendImmediateEmailMock,
  };
});

import { prisma } from '../src/config/prisma.js';
import { issueOtp } from '../src/modules/otp/otp.service.js';

describe('OTP delivery failure handling', () => {
  const email = `otp-failure-${Date.now()}@example.com`;

  beforeEach(async () => {
    sendImmediateEmailMock.mockReset();
    await prisma.emailOtp.deleteMany({
      where: { email },
    });
  });

  afterAll(async () => {
    await prisma.emailOtp.deleteMany({
      where: { email },
    });
    await prisma.$disconnect();
  });

  it('marks a failed delivery as consumed so resend is not throttled by the old row', async () => {
    sendImmediateEmailMock.mockRejectedValueOnce(new Error('smtp down'));

    await expect(
      issueOtp({ email, fullName: 'Test User', purpose: 'REGISTER' }),
    ).rejects.toMatchObject({
      code: 'EMAIL_DELIVERY_FAILED',
      statusCode: 503,
    });

    const failedRow = await prisma.emailOtp.findFirst({
      where: { email, purpose: 'REGISTER' },
      orderBy: { createdAt: 'desc' },
    });
    expect(failedRow).toBeTruthy();
    expect(failedRow.consumedAt).toBeInstanceOf(Date);

    sendImmediateEmailMock.mockResolvedValueOnce({ mode: 'TEST' });

    await expect(
      issueOtp({ email, fullName: 'Test User', purpose: 'REGISTER' }),
    ).resolves.toMatchObject({
      resendAfterSeconds: expect.any(Number),
    });

    const rows = await prisma.emailOtp.findMany({
      where: { email, purpose: 'REGISTER' },
      orderBy: { createdAt: 'asc' },
    });
    expect(rows).toHaveLength(2);
    expect(rows[0].consumedAt).toBeInstanceOf(Date);
    expect(rows[1].consumedAt).toBeNull();
  });
});
