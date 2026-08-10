const SUPPORT_REFERENCE_PREFIX = "WEB";
const SAFE_REFERENCE_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;
const normalizedErrorCache = new WeakMap();

function readReferenceCandidate(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return SAFE_REFERENCE_PATTERN.test(trimmed) ? trimmed : "";
}

export function createSupportReference(prefix = SUPPORT_REFERENCE_PREFIX) {
  const safePrefix = typeof prefix === "string" && prefix.trim() ? prefix.trim().toUpperCase() : SUPPORT_REFERENCE_PREFIX;
  const timePart = Date.now().toString(36).toUpperCase();
  const cryptoApi = globalThis.crypto;
  const randomPart = typeof cryptoApi?.randomUUID === "function"
    ? cryptoApi.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()
    : typeof cryptoApi?.getRandomValues === "function"
      ? Array.from(cryptoApi.getRandomValues(new Uint8Array(6)), (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase()
      : "000000000000";
  return `${safePrefix}-${timePart}-${randomPart}`;
}

export function getRequestReference(error) {
  return readReferenceCandidate(error?.response?.data?.requestId)
    || readReferenceCandidate(error?.response?.headers?.["x-request-id"])
    || readReferenceCandidate(error?.response?.headers?.["X-Request-Id"])
    || readReferenceCandidate(error?.requestReference)
    || readReferenceCandidate(error?.supportReference);
}

function makeCachedErrorResult(error, fallbackMessage) {
  if (error && typeof error === "object") {
    const cached = normalizedErrorCache.get(error);
    if (cached) return cached;
  }

  const response = error?.response;
  const responseMessage = typeof response?.data?.message === "string" ? response.data.message.trim() : "";
  const requestReference = getRequestReference(error);

  let message = fallbackMessage;
  let supportReference = readReferenceCandidate(error?.supportReference);
  let reference = requestReference || supportReference || "";

  if (!response && error?.request) {
    supportReference = supportReference || createSupportReference("NET");
    reference = supportReference;
  } else if (response?.status >= 500) {
    supportReference = supportReference || createSupportReference(requestReference ? "SRV" : "NET");
    reference = requestReference || supportReference;
  } else if (responseMessage) {
    message = responseMessage;
  }

  const normalized = {
    message,
    reference,
    requestReference,
    supportReference,
  };

  if (error && typeof error === "object") {
    normalizedErrorCache.set(error, normalized);
  }

  return normalized;
}

export function getCustomerFacingError(error, fallbackMessage) {
  return makeCachedErrorResult(error, fallbackMessage);
}
