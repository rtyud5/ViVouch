import { describe, it, expect, vi } from "vitest";
import { checkout, getOrders, getVoucherCodes } from "./orders.api";
import { apiClient } from "../../../services/apiClient";

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe("orders.api", () => {
  it("sends checkout payload to cart checkout endpoint", async () => {
    apiClient.post.mockResolvedValue({ data: { data: { orderId: "1" } } });

    const result = await checkout([{ id: "v1", qty: 2 }], "MOMO");

    expect(apiClient.post).toHaveBeenCalledWith("/customer/orders/cart/checkout", {
      items: [{ id: "v1", qty: 2 }],
      paymentMethod: "MOMO",
    });
    expect(result).toEqual({ orderId: "1" });
  });

  it("reads orders from customer orders endpoint", async () => {
    apiClient.get.mockResolvedValue({ data: { data: [{ id: "o1" }] } });

    await expect(getOrders()).resolves.toEqual([{ id: "o1" }]);
    expect(apiClient.get).toHaveBeenCalledWith("/customer/orders");
  });

  it("reads voucher codes from voucher-codes endpoint", async () => {
    apiClient.get.mockResolvedValue({ data: { data: [{ id: "vc1" }] } });

    await expect(getVoucherCodes()).resolves.toEqual([{ id: "vc1" }]);
    expect(apiClient.get).toHaveBeenCalledWith("/customer/orders/voucher-codes");
  });
});
