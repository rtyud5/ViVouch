const SUPPORT_REFERENCE_PREFIX = "WEB";
const SAFE_REFERENCE_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;

function readReferenceCandidate(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return SAFE_REFERENCE_PATTERN.test(trimmed) ? trimmed : "";
}

export function createSupportReference(prefix = SUPPORT_REFERENCE_PREFIX) {
  const safePrefix = typeof prefix === "string" && prefix.trim() ? prefix.trim().toUpperCase() : SUPPORT_REFERENCE_PREFIX;
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${safePrefix}-${timePart}-${randomPart}`;
}

export function getRequestReference(error) {
  return readReferenceCandidate(error?.response?.data?.requestId)
    || readReferenceCandidate(error?.response?.headers?.["x-request-id"])
    || readReferenceCandidate(error?.response?.headers?.["X-Request-Id"])
    || readReferenceCandidate(error?.requestReference)
    || readReferenceCandidate(error?.supportReference);
}

export function getCustomerFacingError(error, fallbackMessage) {
  const statusCode = error?.response?.status;
  const responseMessage = error?.response?.data?.message;
  const specificMessage = typeof responseMessage === "string" && responseMessage.trim() ? responseMessage.trim() : "";

  if (statusCode >= 500 || (!error?.response && error?.request)) {
    const reference = getRequestReference(error) || createSupportReference("NET");
    return {
      message: fallbackMessage,
      reference,
    };
  }

  return {
    message: specificMessage || error?.message || fallbackMessage,
    reference: getRequestReference(error),
  };
}
