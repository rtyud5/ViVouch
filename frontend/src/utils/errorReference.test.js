import { describe, expect, it, vi } from "vitest";
import { createSupportReference, getCustomerFacingError } from "./errorReference";

describe("errorReference", () => {
  it("uses backend requestId for unexpected server errors", () => {
    const error = {
      response: {
        status: 500,
        data: { requestId: "REQ-12345", message: "db down" },
      },
    };

    const next = getCustomerFacingError(error, "Đã xảy ra lỗi. Vui lòng thử lại.");

    expect(next.message).toBe("Đã xảy ra lỗi. Vui lòng thử lại.");
    expect(next.reference).toBe("REQ-12345");
  });

  it("creates a safe local reference for network failures", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.123456);
    vi.spyOn(Date, "now").mockReturnValue(1723262400000);

    const error = { request: {} };
    const next = getCustomerFacingError(error, "Không thể kết nối đến máy chủ.");

    expect(next.message).toBe("Không thể kết nối đến máy chủ.");
    expect(next.reference).toMatch(/^NET-/);
    expect(next.reference).toBe(createSupportReference("NET"));

    vi.restoreAllMocks();
  });
});
