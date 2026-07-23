import { env } from '../../config/env.js';
import { AppError } from '../../utils/appError.js';
import {
  buildPayOsSignatureData,
  createPayOsSignature,
  isValidPayOsSignature,
} from './payos.signature.js';

function assertConfigured() {
  if (!env.PAYOS_CLIENT_ID || !env.PAYOS_API_KEY || !env.PAYOS_CHECKSUM_KEY) {
    throw new AppError('payOS chưa được cấu hình', 503, 'PAYOS_NOT_CONFIGURED');
  }
}

export { buildPayOsSignatureData as buildSignatureData };

export function signPayOsData(data) {
  assertConfigured();
  return createPayOsSignature(data, env.PAYOS_CHECKSUM_KEY);
}

export function verifyPayOsWebhook(payload) {
  if (!payload || typeof payload !== 'object' || !payload.data || !payload.signature) return false;
  assertConfigured();
  return isValidPayOsSignature(payload.data, payload.signature, env.PAYOS_CHECKSUM_KEY);
}

export async function createPayOsPaymentLink({ orderCode, amount, description }) {
  assertConfigured();
  const expiresAt = Math.floor(Date.now() / 1000) + env.PAYOS_LINK_EXPIRES_MINUTES * 60;
  // payOS payment-request signature covers exactly these five fields.
  const signedPayload = {
    orderCode: Number(orderCode),
    amount: Number(amount),
    description: String(description).slice(0, 25),
    cancelUrl: env.PAYOS_CANCEL_URL,
    returnUrl: env.PAYOS_RETURN_URL,
  };
  const payload = {
    ...signedPayload,
    expiredAt: expiresAt,
    signature: createPayOsSignature(signedPayload, env.PAYOS_CHECKSUM_KEY),
  };

  let response;
  try {
    response = await fetch(`${env.PAYOS_API_BASE_URL}/v2/payment-requests`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-client-id': env.PAYOS_CLIENT_ID,
        'x-api-key': env.PAYOS_API_KEY,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    throw new AppError(`Không thể kết nối payOS: ${error.message}`, 502, 'PAYOS_UNAVAILABLE');
  }

  const body = await response.json().catch(() => null);
  if (!response.ok || body?.code !== '00' || !body?.data?.checkoutUrl) {
    throw new AppError(body?.desc || 'Không thể tạo liên kết thanh toán payOS', 502, 'PAYOS_CREATE_LINK_FAILED');
  }
  return body.data;
}
