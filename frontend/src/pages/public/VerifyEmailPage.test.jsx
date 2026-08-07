import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-router-dom", () => ({
  Link: ({ children, ...props }) => React.createElement("a", props, children),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams("email=verify@example.com"), vi.fn()],
}));

vi.mock("../../features/auth/api/auth.api", () => ({
  resendVerification: vi.fn(),
  verifyEmail: vi.fn(),
}));

import { VerifyEmailPage } from "./VerifyEmailPage";

describe("VerifyEmailPage", () => {
  it("masks the OTP input", () => {
    const markup = renderToStaticMarkup(React.createElement(VerifyEmailPage));

    expect(markup).toContain('type="password"');
    expect(markup).toContain('inputMode="numeric"');
  });
});
