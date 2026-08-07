import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-router-dom", () => ({
  Link: ({ children, ...props }) => React.createElement("a", props, children),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams("email=staff@example.com"), vi.fn()],
}));

vi.mock("../../features/auth/api/auth.api", () => ({
  completeStaffSetup: vi.fn(),
  resendStaffSetup: vi.fn(),
}));

import { StaffSetupPage } from "./StaffSetupPage";

describe("StaffSetupPage", () => {
  it("masks the OTP input for staff setup", () => {
    const markup = renderToStaticMarkup(React.createElement(StaffSetupPage));

    expect(markup).toMatch(
      /<input[^>]*type="password"[^>]*autoComplete="one-time-code"/,
    );
    expect(markup).toContain('autoComplete="one-time-code"');
  });
});
