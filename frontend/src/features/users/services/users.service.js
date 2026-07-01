import * as usersApi from "../api/users.api";
import * as usersMock from "../mocks/users.mock";

/**
 * Tạm thời fallback sang mock khi backend /users/* chưa sẵn sàng.
 * Khi API users hoàn thiện, các hàm này sẽ tự dùng API thật.
 */
const FORCE_MOCK = import.meta.env.VITE_USE_USERS_MOCK === "true";

function sanitizeUser(user) {
  if (!user) return user;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function shouldUseMock(error) {
  if (FORCE_MOCK) return true;

  // Only allow fallback in development environment when API is not implemented
  if (import.meta.env.DEV) {
    if (!error?.response) return true;
    const status = error.response.status;
    return status === 404 || status === 405 || status === 501;
  }

  return false;
}

async function withMockFallback(apiCall, mockCall) {
  if (FORCE_MOCK) {
    return sanitizeUser(await mockCall());
  }

  try {
    return sanitizeUser(await apiCall());
  } catch (error) {
    if (shouldUseMock(error)) {
      return sanitizeUser(await mockCall());
    }
    throw error;
  }
}

export function getMe() {
  return withMockFallback(usersApi.getMe, usersMock.mockGetMe);
}

export function updateProfile(data) {
  return withMockFallback(
    () => usersApi.updateProfile(data),
    () => usersMock.mockUpdateProfile(data)
  );
}

export function changePassword(data) {
  return withMockFallback(
    () => usersApi.changePassword(data),
    () => usersMock.mockChangePassword(data)
  );
}
