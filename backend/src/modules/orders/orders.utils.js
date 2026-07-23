import { createHash, randomInt } from 'node:crypto';

export function aggregateAndSortItems(items) {
  const quantities = new Map();
  for (const item of items || []) {
    const id = String(item.id || '');
    const qty = Number(item.qty || 1);
    if (!id || !Number.isInteger(qty) || qty <= 0) continue;
    quantities.set(id, (quantities.get(id) || 0) + qty);
  }
  return [...quantities.entries()]
    .map(([id, qty]) => ({ id, qty }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function createCheckoutFingerprint(items, data) {
  const canonical = {
    items,
    paymentMethod: data.paymentMethod,
    recipientName: data.recipientName || null,
    recipientPhone: data.recipientPhone || null,
    note: data.note || null,
  };
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}

export function createNumericProviderOrderCode() {
  // 16 digits, below Number.MAX_SAFE_INTEGER, with 1,000 values per millisecond.
  return String(Date.now() * 1000 + randomInt(0, 1000));
}
