import { describe, it, expect, vi } from "vitest";
import { invalidateCheckoutQueries } from "./useCheckout";

describe("invalidateCheckoutQueries", () => {
  it("invalidates cart, orders, and voucher-codes caches", async () => {
    const queryClient = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    };

    await invalidateCheckoutQueries(queryClient);

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["cart"] });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["orders"] });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["voucher-codes"] });
  });
});
