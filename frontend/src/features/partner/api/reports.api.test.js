import { describe, expect, it, vi } from "vitest";
import { apiClient } from "../../../services/apiClient";
import { getPartnerReports } from "./reports.api";

vi.mock("../../../services/apiClient", () => ({
  apiClient: { get: vi.fn() },
}));

describe("getPartnerReports", () => {
  it("requests the owner-only report endpoint and preserves commission values from the API", async () => {
    const apiReport = {
      data: {
        summary: {
          revenue: 1000000,
          commissionRate: 15,
          platformFee: 150000,
          estimatedPartnerRevenue: 850000,
        },
      },
    };
    apiClient.get.mockResolvedValue({ data: apiReport });

    await expect(getPartnerReports(30)).resolves.toEqual(apiReport);
    expect(apiClient.get).toHaveBeenCalledWith("/partner/reports", { params: { range: 30 } });
  });
});
