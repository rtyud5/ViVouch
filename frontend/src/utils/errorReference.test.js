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
    expect(next.requestReference).toBe("REQ-12345");
    expect(next.supportReference).toMatch(/^SRV-/);
  });

  it("creates a safe local reference for network failures", () => {
    vi.spyOn(Date, "now").mockReturnValue(1723262400000);
    const cryptoMock = {
      randomUUID: vi.fn(() => "12345678-1234-1234-1234-123456789abc"),
      getRandomValues: vi.fn(),
    };
    vi.stubGlobal("crypto", cryptoMock);

    const error = { request: {} };
    const next = getCustomerFacingError(error, "Không thể kết nối đến máy chủ.");

    expect(next.message).toBe("Không thể kết nối đến máy chủ.");
    expect(next.reference).toMatch(/^NET-/);
    expect(next.reference).toBe(createSupportReference("NET"));
    expect(next.supportReference).toBe(next.reference);

    const repeat = getCustomerFacingError(error, "Không thể kết nối đến máy chủ.");
    expect(repeat.reference).toBe(next.reference);
    expect(repeat.supportReference).toBe(next.supportReference);

    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("does not leak raw non-Axios exception messages", () => {
    const error = new Error("Cannot read property secretToken of undefined");
    const next = getCustomerFacingError(error, "Đã xảy ra lỗi. Vui lòng thử lại.");

    expect(next.message).toBe("Đã xảy ra lỗi. Vui lòng thử lại.");
    expect(next.reference).toBe("");
  });
});
