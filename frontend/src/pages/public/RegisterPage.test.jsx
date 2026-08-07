import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-router-dom", () => ({
  Link: ({ children, ...props }) => React.createElement("a", props, children),
  useLocation: () => ({ state: { message: "Đã gửi OTP thành công" } }),
  useNavigate: () => vi.fn(),
}));

vi.mock("../../features/auth/api/auth.api", () => ({
  register: vi.fn(),
}));

import { RegisterPage } from "./RegisterPage";

describe("RegisterPage", () => {
  it("renders the registration card with masked password inputs", () => {
    const markup = renderToStaticMarkup(React.createElement(RegisterPage));

    expect(markup).toContain("Tạo tài khoản để nhận ưu đãi mỗi ngày");
    expect(markup).toContain('type="password"');
    expect(markup).toContain("Đăng ký trở thành đối tác");
    expect(markup).toContain("Đã có tài khoản?");
  });
});
