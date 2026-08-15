import { PayOS } from '@payos/node';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/appError.js';
import {
  buildPayOsSignatureData,
  createPayOsSignature,
} from './payos.signature.js';

let payosInstance = null;

export function getPayOS() {
  if (!env.PAYOS_CLIENT_ID || !env.PAYOS_API_KEY || !env.PAYOS_CHECKSUM_KEY) {
    throw new AppError('payOS chưa được cấu hình', 503, 'PAYOS_NOT_CONFIGURED');
  }
  if (!payosInstance) {
    payosInstance = new PayOS({
      clientId: env.PAYOS_CLIENT_ID,
      apiKey: env.PAYOS_API_KEY,
      checksumKey: env.PAYOS_CHECKSUM_KEY
    });
  }
  return payosInstance;
}

export { buildPayOsSignatureData as buildSignatureData };

export function signPayOsData(data) {
  if (!env.PAYOS_CLIENT_ID || !env.PAYOS_API_KEY || !env.PAYOS_CHECKSUM_KEY) {
    throw new AppError('payOS chưa được cấu hình', 503, 'PAYOS_NOT_CONFIGURED');
  }
  return createPayOsSignature(data, env.PAYOS_CHECKSUM_KEY);
}

export async function verifyPayOsWebhook(payload) {
  if (!payload || typeof payload !== 'object' || !payload.data || !payload.signature) return false;
  try {
    const payos = getPayOS();
    await payos.webhooks.verify(payload);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    return false;
  }
}

export async function createPayOsPaymentLink({ orderCode, amount, description }) {
  const expiresAt = Math.floor(Date.now() / 1000) + env.PAYOS_LINK_EXPIRES_MINUTES * 60;

  const payload = {
    orderCode: Number(orderCode),
    amount: Math.max(2000, Math.floor(Number(amount) / 10)), // Chia 10, tối thiểu 2000 VND theo limit của payOS
    description: String(description).slice(0, 25),
    cancelUrl: env.PAYOS_CANCEL_URL,
    returnUrl: env.PAYOS_RETURN_URL,
    expiredAt: expiresAt,
  };

  try {
    const payos = getPayOS();
    const paymentLinkRes = await payos.paymentRequests.create(payload);
    return paymentLinkRes;
  } catch (error) {
    throw new AppError(`Không thể tạo liên kết thanh toán payOS: ${error.message}`, 502, 'PAYOS_CREATE_LINK_FAILED');
  }
}
 // trigger deploy
