import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-router-dom", () => ({
  Link: ({ children, ...props }) => React.createElement("a", props, children),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams("step=RESET&email=reset@example.com"), vi.fn()],
}));

vi.mock("../../features/auth/api/auth.api", () => ({
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
}));

import { ForgotPasswordPage } from "./ForgotPasswordPage";

describe("ForgotPasswordPage", () => {
  it("renders the recovery step with masked OTP input and email field", () => {
    const markup = renderToStaticMarkup(React.createElement(ForgotPasswordPage));

    expect(markup).toContain('placeholder="Email"');
    expect(markup).toContain('type="password"');
    expect(markup).toContain('placeholder="OTP"');
  });
});
