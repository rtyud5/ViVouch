import { createHmac, timingSafeEqual } from 'node:crypto';

function sortObject(value) {
  return Object.keys(value)
    .sort()
    .reduce((result, key) => {
      result[key] = value[key];
      return result;
    }, {});
}

function normalizeValue(value) {
  if (value === null || value === undefined || value === 'null' || value === 'undefined') return '';
  if (Array.isArray(value)) {
    return JSON.stringify(value.map((item) => (
      item && typeof item === 'object' && !Array.isArray(item) ? sortObject(item) : item
    )));
  }
  if (typeof value === 'object') return JSON.stringify(sortObject(value));
  return String(value);
}

export function buildPayOsSignatureData(data) {
  return Object.keys(data || {})
    .filter((key) => data[key] !== undefined)
    .sort()
    .map((key) => `${key}=${normalizeValue(data[key])}`)
    .join('&');
}

export function createPayOsSignature(data, checksumKey) {
  if (!checksumKey) throw new Error('payOS checksum key is required');
  return createHmac('sha256', checksumKey)
    .update(buildPayOsSignatureData(data))
    .digest('hex');
}

export function isValidPayOsSignature(data, signature, checksumKey) {
  if (!data || !signature || !checksumKey) return false;
  const expected = Buffer.from(createPayOsSignature(data, checksumKey), 'hex');
  const actual = Buffer.from(String(signature).toLowerCase(), 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
