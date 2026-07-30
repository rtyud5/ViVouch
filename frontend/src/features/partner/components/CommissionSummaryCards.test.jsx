import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CommissionSummaryCards } from "./CommissionSummaryCards";

describe("CommissionSummaryCards", () => {
  it("renders all API-provided commission figures with estimated wording", () => {
    const markup = renderToStaticMarkup(
      <CommissionSummaryCards
        summary={{
          revenue: 1000000,
          commissionRate: 15,
          platformFee: 150000,
          estimatedPartnerRevenue: 850000,
        }}
      />,
    );

    expect(markup).toContain("Tổng doanh thu");
    expect(markup).toContain("1.000.000 ₫");
    expect(markup).toContain("15%");
    expect(markup).toContain("150.000 ₫");
    expect(markup).toContain("850.000 ₫");
    expect(markup).toContain("chưa phải khoản payout thực tế");
  });

  it("renders loading placeholders before the report API responds", () => {
    const markup = renderToStaticMarkup(<CommissionSummaryCards isLoading />);

    expect((markup.match(/Đang tải tóm tắt hoa hồng/g) || [])).toHaveLength(4);
  });
});
