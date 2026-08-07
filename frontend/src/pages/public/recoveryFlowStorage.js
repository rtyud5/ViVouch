export function readStoredFlow(storageKey) {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return {};
    const flow = JSON.parse(raw);
    return flow && typeof flow === 'object' && !Array.isArray(flow) ? flow : {};
  } catch {
    return {};
  }
}

export function writeStoredFlow(storageKey, flow) {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(flow));
  } catch {
    // Storage is best-effort only; the recovery flow must still render safely.
  }
}

export function getInitialCooldownSeconds(cooldownUntil) {
  if (!cooldownUntil || Number.isNaN(cooldownUntil)) return 0;
  const remaining = Math.ceil((cooldownUntil - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}
