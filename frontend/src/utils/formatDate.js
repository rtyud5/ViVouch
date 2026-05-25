export function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("vi-VN") : "";
}
