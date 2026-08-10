import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-router-dom", () => ({
  Link: ({ children, ...props }) => React.createElement("a", props, children),
}));

import { GlobalErrorBoundary } from "./GlobalErrorBoundary";

describe("GlobalErrorBoundary", () => {
  it("renders a safe support reference in the fallback UI", () => {
    const boundary = new GlobalErrorBoundary({ children: React.createElement("div", null, "child") });
    boundary.state = {
      hasError: true,
      error: new Error("boom"),
      supportReference: "UI-TEST-123",
    };

    const markup = renderToStaticMarkup(boundary.render());

    expect(markup).toContain("Mã tham chiếu an toàn");
    expect(markup).toContain("UI-TEST-123");
  });
});
