import { nanoid } from "nanoid";

export function generateVoucherCode() {
  return `VC-${new Date().getFullYear()}-${nanoid(10).toUpperCase()}`;
}
