import * as usersApi from "../api/users.api";

function sanitizeUser(user) {
  if (!user) return user;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function getMe() {
  const user = await usersApi.getMe();
  return sanitizeUser(user);
}

export async function updateProfile(data) {
  const user = await usersApi.updateProfile(data);
  return sanitizeUser(user);
}

export async function changePassword(data) {
  return usersApi.changePassword(data);
}
