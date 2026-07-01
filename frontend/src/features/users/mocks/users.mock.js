import { useAuthStore } from "../../../stores/authStore";

const MOCK_PROFILE_KEY = "vivouch-mock-profile";
const MOCK_PASSWORD_KEY = "vivouch-mock-current-password";
const DEFAULT_MOCK_PASSWORD = "Test@123";

function readMockProfile() {
  try {
    const raw = sessionStorage.getItem(MOCK_PROFILE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeMockProfile(patch) {
  const next = { ...readMockProfile(), ...patch };
  sessionStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(next));
  return next;
}

function getAuthUser() {
  return useAuthStore.getState().user;
}

function buildMockUser(overrides = {}) {
  const authUser = getAuthUser() || {};
  const saved = readMockProfile();

  return {
    id: authUser.id || saved.id || "mock-user-id",
    email: authUser.email || saved.email || "customer1@test.com",
    fullName: saved.fullName ?? authUser.fullName ?? "Nguyễn Văn A",
    phone: saved.phone ?? authUser.phone ?? "0901000001",
    role: authUser.role || "CUSTOMER",
    status: authUser.status || "ACTIVE",
    ...overrides,
  };
}

function createMockError(message, status = 400) {
  const error = new Error(message);
  error.response = { status, data: { message } };
  return error;
}

export async function mockGetMe() {
  await delay(300);
  return buildMockUser();
}

export async function mockUpdateProfile(data) {
  await delay(400);

  const fullName = data.fullName?.trim();
  if (!fullName) {
    throw createMockError("Họ tên không được để trống");
  }

  const phone = data.phone?.trim() || null;
  writeMockProfile({ fullName, phone });

  const updatedUser = buildMockUser({ fullName, phone });
  const { accessToken } = useAuthStore.getState();
  useAuthStore.getState().setAuth({ user: updatedUser, accessToken });

  return updatedUser;
}

export async function mockChangePassword({ currentPassword, newPassword }) {
  await delay(400);

  const expectedPassword =
    sessionStorage.getItem(MOCK_PASSWORD_KEY) || DEFAULT_MOCK_PASSWORD;

  if (currentPassword !== expectedPassword) {
    throw createMockError("Mật khẩu hiện tại không đúng");
  }

  if (!newPassword || newPassword.length < 6) {
    throw createMockError("Mật khẩu mới phải có ít nhất 6 ký tự");
  }

  sessionStorage.setItem(MOCK_PASSWORD_KEY, newPassword);
  return { success: true };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
