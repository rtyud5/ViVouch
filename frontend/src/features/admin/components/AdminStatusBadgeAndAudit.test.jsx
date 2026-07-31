import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AdminStatusBadge } from "./AdminStatusBadge";

describe("AdminStatusBadge and Audit/Refund status mapping", () => {
  it("renders refund request statuses correctly", () => {
    const requestedMarkup = renderToStaticMarkup(<AdminStatusBadge status="REQUESTED" />);
    expect(requestedMarkup).toContain("Chờ duyệt hoàn");

    const manualMarkup = renderToStaticMarkup(<AdminStatusBadge status="MANUAL_REFUND_REQUIRED" />);
    expect(manualMarkup).toContain("Chờ hoàn thủ công payOS");

    const refundedMarkup = renderToStaticMarkup(<AdminStatusBadge status="REFUNDED" />);
    expect(refundedMarkup).toContain("Đã hoàn tiền");
  });

  it("renders support ticket statuses correctly", () => {
    const openMarkup = renderToStaticMarkup(<AdminStatusBadge status="OPEN" />);
    expect(openMarkup).toContain("Mới");

    const procMarkup = renderToStaticMarkup(<AdminStatusBadge status="PROCESSING" />);
    expect(procMarkup).toContain("Đang xử lý");

    const resMarkup = renderToStaticMarkup(<AdminStatusBadge status="RESOLVED" />);
    expect(resMarkup).toContain("Đã giải quyết");
  });

  it("renders partner and order statuses correctly", () => {
    const activePartner = renderToStaticMarkup(<AdminStatusBadge status="ACTIVE" />);
    expect(activePartner).toContain("Hoạt động");

    const completedOrder = renderToStaticMarkup(<AdminStatusBadge status="COMPLETED" />);
    expect(completedOrder).toContain("Hoàn thành");
  });
});
