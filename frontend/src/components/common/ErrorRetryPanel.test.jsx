import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ErrorRetryPanel } from "./ErrorRetryPanel";

describe("ErrorRetryPanel", () => {
  it("renders a safe request reference for server errors", () => {
    const markup = renderToStaticMarkup(
      React.createElement(ErrorRetryPanel, {
        title: "Không thể tải dữ liệu",
        description: "Dữ liệu tạm thời không truy cập được.",
        error: {
          response: {
            status: 500,
            data: { requestId: "REQ-ABC-123" },
          },
        },
        onRetry: () => {},
      })
    );

    expect(markup).toContain("Mã tham chiếu an toàn");
    expect(markup).toContain("REQ-ABC-123");
  });
});
